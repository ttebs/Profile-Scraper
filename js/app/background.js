chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.create({
      url: 'http://www.getparsley.net/welcome',
      active: true
    });
    return false;
});


window.TOKEN = localStorage.getItem("jobadder_access_token")
window.ENDPOINT = localStorage.getItem("jobadder_api_endpoint")
window.LOGIN_ENDPOINT = 'https://parsley-api-prod.herokuapp.com/api/v1'

let userDetails = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    address: {
        city: '',
        state: '',
        country: '',
    },
    employment: {
        current: {
            employer: '',
            position: ''
        }
    },
    status: {
        name: 'test'
    },
    createdAt: '',
    updatedAt: ''
}
let userExist = false
let headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`
}


function setTrialDaysRemaining(nextBillingDate) {
    let now = new Date();
    const _nextBillingDate = new Date(nextBillingDate);
    const t = (_nextBillingDate - now);

    var cd = 24 * 60 * 60 * 1000
    var ch = 60 * 60 * 1000
    var d = Math.floor(t / cd)
    var h = Math.floor( (t - d * cd) / ch)
    var m = Math.round( (t - d * cd - h * ch) / 60000)

    chrome.runtime.sendMessage({method:"setTrialPeriod", days: d},function(response){});
}

async function processAPI (query, method, token) {
    window.TOKEN = localStorage.getItem("jobadder_access_token")
    window.ENDPOINT = localStorage.getItem("jobadder_api_endpoint")
    window.LOGIN_ENDPOINT = 'https://parsley-api-prod.herokuapp.com/api/v1'
    
    let data = null
    try {
        const req = await fetch(`${ENDPOINT}${query}`, {
            method,
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`                
            }
        })
        data = await req.json()
        if(data && data.message == "Authorization has been denied for this request.") {
            const result = await fetch(`${LOGIN_ENDPOINT}/user/jobadder/refresh-token`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            const loginResponse = await result.json()
            window.TOKEN = loginResponse.data.accessToken
            localStorage.setItem("jobadder_access_token",TOKEN);
            headers = {
                Accept: 'application/json',
                Authorization: `Bearer ${TOKEN}`
            }
            data = await processAPI(query, method, loginResponse.data.accessToken)
        }
    } catch(e) {
        throw new Error('e ', e)
    }
    return data;
}

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    const email = message.email ? message.email : ''
    if(message.type == "autoLogin") {
        if(localStorage.getItem("logged_in")) {
            const user_next_billing = localStorage.getItem("user_next_billing")
            const login_email = localStorage.getItem("user_email")
            const last_login = localStorage.getItem("user_last_login")

            if(user_next_billing) setTrialDaysRemaining(user_next_billing)

            let now = new Date();
            const _lastLogin = new Date(last_login);
            const oneDay = 60 * 60 * 24 * 1000
            const oneDayTimeDifference = (now - _lastLogin) > oneDay;
            
            var searchCandidate = async () => {
                try {
                    chrome.runtime.sendMessage({method:"Searching", action: 'start', name: message.name},function(response){});
                    const foundCandidateResponse = await processAPI(`/candidates?name=${message.name}&email=${email}`, 'GET', TOKEN)
                    const foundContactsResponse = await processAPI(`/contacts?name=${message.name}&email=${email}`, 'GET', TOKEN)

                    if(!foundCandidateResponse.totalCount && !foundContactsResponse.totalCount) {
                        userExist = false
                        chrome.runtime.sendMessage({method:"getWord"},function(response){});
                        chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});
                    } else if (foundContactsResponse.totalCount == 1 && !foundCandidateResponse.totalCount) {
                        const contactResponse = await processAPI(`/contacts/${foundContactsResponse.items[0].contactId}`, 'GET', TOKEN)
                        contactDetails = contactResponse
                        chrome.runtime.sendMessage({method:"contactExist", contact:contactDetails},function(response){});

                        // get contact note types
                        const contactNoteTypesResponse = await processAPI(`/contacts/lists/notetype`, 'GET', TOKEN)
                        chrome.runtime.sendMessage({method:"contactNoteTypes", noteTypes: contactNoteTypesResponse.items},function(response){});

                        // get contact notes
                        let noteTypesArr = []
                        for (const item of contactNoteTypesResponse.items) {
                            noteTypesArr.push(item.name)
                        }
                        if(foundContactsResponse.items[0].contactId) {
                            const contactNotesResponse = await processAPI(`/contacts/${foundContactsResponse.items[0].contactId}/notes`, 'GET', TOKEN)
                            let contactNotesArr = []
                            for (const item of contactNotesResponse.items) {
                                if(noteTypesArr.includes(item.type)) {
                                    contactNotesArr.push({
                                        type: item.type,
                                        note: item.textPartial,
                                        createdAt: item.createdAt,
                                        createdBy: `${item.createdBy.firstName} ${item.createdBy.lastName}`
                                    })
                                }
                            }
                            chrome.runtime.sendMessage({method:"contactNotesList", notesList: contactNotesArr},function(response){});
                        }
                        chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});
                    } else if (foundCandidateResponse.totalCount == 1 && !foundContactsResponse.totalCount) {
                        const candidateResponse = await processAPI(`/candidates/${foundCandidateResponse.items[0].candidateId}`, 'GET', TOKEN)
                        userDetails = candidateResponse
                        userExist = true
                        chrome.runtime.sendMessage({method:"userExist", user:userDetails},function(response){});
                        chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});

                        // get note types
                        const noteTypesResponse = await processAPI(`/candidates/lists/notetype`, 'GET', TOKEN)
                        chrome.runtime.sendMessage({method:"noteTypes", noteTypes: noteTypesResponse.items},function(response){});

                        // get candidate notes
                        let noteTypesArr = []
                        for (const item of noteTypesResponse.items) {
                            noteTypesArr.push(item.name)
                        }
                        if(foundCandidateResponse.items[0].candidateId) {
                            const candidateNotesResponse = await processAPI(`/candidates/${foundCandidateResponse.items[0].candidateId}/notes`, 'GET', TOKEN)
                            let candidateNotesArr = []
                            for (const item of candidateNotesResponse.items) {
                                if(noteTypesArr.includes(item.type)) {
                                    candidateNotesArr.push({
                                        type: item.type,
                                        note: item.textPartial,
                                        createdAt: item.createdAt,
                                        createdBy: `${item.createdBy.firstName} ${item.createdBy.lastName}`
                                    })
                                }
                            }
                            chrome.runtime.sendMessage({method:"notesList", notesList: candidateNotesArr},function(response){});
                        }
                    } else if ((foundCandidateResponse.totalCount > 1 || foundContactsResponse.totalCount > 1) || (foundCandidateResponse.totalCount == 1 && foundContactsResponse.totalCount == 1)) {
                        let _candidateList = []
                        let _contactList = []

                        // candidate
                        if(foundCandidateResponse.totalCount > 0) {
                            const promise = [];
                            for (const can of foundCandidateResponse.items) {
                                const reqDetail = await fetch(can.links.self, {
                                    method: "GET",
                                    headers
                                })
                                promise.push(reqDetail)
                            }
                            const allCandidateInfos = await Promise.all(promise);
                            
                            promise.length = 0
                            for (const item of allCandidateInfos) {
                                const candidateResponse = await item.json()
                                promise.push(candidateResponse)
                            }
                            _candidateList = await Promise.all(promise);
                        }

                        //contact
                        if(foundContactsResponse.totalCount > 0){
                            const promise = [];
                            for (const can of foundContactsResponse.items) {
                                const reqDetail = await fetch(can.links.self, {
                                    method: "GET",
                                    headers
                                })
                                promise.push(reqDetail)
                            }
                            const addContactInfos = await Promise.all(promise);
                            
                            promise.length = 0
                            for (const item of addContactInfos) {
                                const contactResponse = await item.json()
                                promise.push(contactResponse)
                            }
                            _contactList = await Promise.all(promise);
                        }

                        const result = _candidateList.concat(_contactList)

                        chrome.runtime.sendMessage({method:"multipleSearch", list: result, searchText: message.name},function(response){});
                        chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});
                    } 
                } catch (error) {
                    console.log(error)
                }
            }

            if(oneDayTimeDifference) {
                const verifyLicense = await fetch(`${LOGIN_ENDPOINT}/team/jobadder/license?email=${login_email}`, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                const verifyLicenseResponse = await verifyLicense.json()

                if(!verifyLicenseResponse.allowed){
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("logged_in");
                    localStorage.removeItem("jobadder_access_token");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("user_email");
                    localStorage.removeItem("user_last_login");
                    localStorage.removeItem("user_next_billing");

                    chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});
                    chrome.runtime.sendMessage({method:"verifyLicenceFailure"},function(response){});
                } else {
                    const current_date = now.toISOString()
                    localStorage.setItem("user_last_login", current_date);
                    searchCandidate()
                }
            } else {
                searchCandidate()
            }
        }else {
            chrome.runtime.sendMessage({method:"not-logged-in"},function(response){});
            chrome.runtime.sendMessage({method:"signout"},function(response){});
            chrome.runtime.sendMessage({method:"Searching", action: 'end'},function(response){});
        }
    } 
    // return true;
    sendResponse('success');
});

// disable CE in linkedIn homepage (LINKEDIN)
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if(details.url.includes("https://www.linkedin.com/in/")) {
        chrome.tabs.executeScript(null, { file: 'js/lib/jquery-3.6.0.min.js' });
        chrome.pageAction.show(details.tabId);
    } else {
        chrome.pageAction.hide(details.tabId);
    }
});

// run content script
function runContentScript() {
    chrome.tabs.executeScript(null, { file: 'js/app/content.js' });
};

// This function is called onload in the popup code
function getPageDetails(callback) {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message.type == "linkedinScrap")
            callback(message.fields, localStorage.getItem("logged_in"));
        sendResponse('success');
    });
};

// get linkedin name for searching
function getName(callback) {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message.type == "autoLogin") {
            callback({name: message.name, email: message.email});
        }
        sendResponse('success');
    });
};

// enable popup based on allowed website
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
    if (request.message === "activate_icon") {
        chrome.pageAction.show(sender.tab.id);

        // stackoverflow
        if(request.currentTab == "https://stackoverflow.com/users" || request.currentTab == "https://stackoverflow.com/users/") {
            chrome.pageAction.hide(sender.tab.id);
        }

        //github 
        if(!request.profileName) chrome.pageAction.hide(sender.tab.id);
    }
    sendResponse('success');
});

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet()
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `)
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `)
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ]
    }
  })
}


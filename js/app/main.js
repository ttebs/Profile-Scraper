window.TOKEN = localStorage.getItem("jobadder_access_token")
window.ENDPOINT = localStorage.getItem("jobadder_api_endpoint")
window.JOB_ADDER_URL = "https://us1.jobadder.com"
window.LOGIN_ENDPOINT = 'https://parsley-api-prod.herokuapp.com/api/v1'
let headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
}

const getRecruiterList = async e => {
    const user_id = localStorage.getItem("user_id")
    try {
        const response = await processAPI(`/users`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (let x = 0; x < response.items.length; x++) { 
                    const item = response.items[x]
                    const selected = (item.userId == user_id) ? "selected" : ""
                    options += `<option value="${item.userId}" ${selected}>${item.firstName} ${item.lastName}</option>`
                }
                $('#recruiter').html(options)
                $('#owner').html(options)
                $('#userRecruiter').html(options)
                $('#contactRecruiter').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getSalutationList = async e => {
    try {
        const response = await processAPI(`/candidates/lists/salutation`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (const item of response.items) {
                    options += `<option value="${item.name}">${item.name}</option>`
                }
                $('#salutation').html(options)
                $('#userSalutation').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getContactSalutationList = async e => {
    try {
        const response = await processAPI(`/contacts/lists/salutation`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (const item of response.items) {
                    options += `<option value="${item.name}">${item.name}</option>`
                }
                $('#contactSalutation').html(options)
                $('#editContactSalutation').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getCandidateStatusList = async e => {
    try {
        const response = await processAPI(`/candidates/lists/status`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (const item of response.items) {
                    options += `<option value="${item.statusId}">${item.name}</option>`
                }
                $('#candidateStatus').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getContactStatusList = async e => {
    try {
        const response = await processAPI(`/contacts/lists/status`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (const item of response.items) {
                    options += `<option value="${item.statusId}">${item.name}</option>`
                }
                $('#contactStatus').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getCandidateApplicationStatusList = async e => {
    try {
        const response = await processAPI(`/applications/lists/status`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            if(response.items.length > 0){
                let options = '<option value="default" selected>Choose...</option>'
                for (const item of response.items) {
                    options += `<option value="${item.statusId}">${item.name}</option>`
                }
                $('#status').html(options)
                $('#userStatus').html(options)
            }
        }
    }  catch (error) {
        console.log(error)
    }
};

const getJobsList = async e => {
    try {
        const response = await processAPI(`/jobs?sort=-createdAt`, 'GET', TOKEN)
        if(response.hasOwnProperty('items')) {
            let options = '<option value="default" selected>Choose...</option>'
            let company_name = '...'
            for (const item of response.items) {
                if(item.hasOwnProperty('company')) company_name = item.company.name
                options += `<option value="${item.jobId}">${company_name} - ${item.jobTitle} ${item.jobId}</option>`
            }
            $('#addToJob').html(options)
        }
        
    }  catch (error) {
        console.log(error)
    }
};

const findCompany = async e => {
    const employer = $('#currentEmployer').val()
    if(employer) {
        try {
            const result = await fetch(`${ENDPOINT}/companies?name=${employer}`, {
                method: "GET",
                headers
            })
            const response = await result.json()
            const name = response.items[0] && response.items[0].name ? response.items[0].name : ''
            if(!name) {
                $('#contactCompany').val(employer)
                searchCompany(employer)
            } else {
                $('#contactCompanyID').val(response.items[0].companyId)
                $('#contactCompany').val(name)
            }
            
        }  catch (error) {
            console.log(error)
        }
    } else {
        $('#contactCompanyContainer .input-group-append').css('display', 'block')
        $('#contact-create-company').css('display', 'block')

    }
};

const searchCountry = async (country) => {
    const _countries = await $.getJSON("./countries.json", function(data){
        return data
    }).fail(function(){
        console.log("An error has occurred.");
    });
    return _countries.find(item => item.name == country.trim())
}

async function onPageDetailsReceived(pageDetails, isLogin) {
    const name = pageDetails.name.trim().split(" ")
    const currentPosition = pageDetails.position.trim()
    const currentEmployer = pageDetails.employer.trim()
    const address = pageDetails.address.trim().split(",")
    const email = pageDetails.email.trim()
    const phone = pageDetails.phone.trim()

    // name
    let firstName = ""
    let lastName = ""
    let count = 0
    
    for (const item of name) {
        if(name.length - 1 !== count) firstName += `${item} `
        else if (name.length - 1 == 0) firstName += `${item} `
        else lastName += `${item} `
        count++
    }

    let city = ""
    let state = ""
    let country = ""
    
    if(pageDetails.siteUrl.includes('https://angel.co')) {
        state = address[0]
    } else if (pageDetails.siteUrl.includes('https://resumes.indeed.com/')) {
        if(address.length == 1) state = address[0]
        else if(address.length == 2) {
            city = address[0]
            state = address[1]
        } else {
            city = address[0]
            state = address[1]
            country = address[2]
        }
    } else {
        if(address.length == 1){
            let countryCode = await searchCountry(address[0])
            if(countryCode) country = address[0]
            else city = address[0]
        } else if(address.length == 2) {
            let countryCode = await searchCountry(address[1])
            if(countryCode) {
                state = address[0]
                country = address[1]
            } else {
                city = address[0]
                state = address[1]
            }
        } else {
            city = address[0]
            state = address[1]
            country = address[2]
        }
    }

    if(pageDetails.twitterUrl) document.getElementById('twitterUrl').value = pageDetails.twitterUrl;
    if(pageDetails.linkedInUrl) document.getElementById('linkedInUrl').value = pageDetails.linkedInUrl;
    if(pageDetails.facebookUrl) document.getElementById('facebookUrl').value = pageDetails.facebookUrl;
    
    document.getElementById('firstName').value = firstName.trim();
    document.getElementById('contactFirstName').value = firstName.trim();
    document.getElementById('lastName').value = lastName.trim();
    document.getElementById('contactLastName').value = lastName.trim();
    document.getElementById('currentEmployer').value = currentEmployer;
    document.getElementById('currentPosition').value = currentPosition;
    document.getElementById('contactPosition').value = currentPosition;
    document.getElementById('email').value = email;
    document.getElementById('contactEmail').value = email;
    document.getElementById('phone').value = phone;
    document.getElementById('contactPhone').value = phone;
    document.getElementById('city').value = city.trim();
    document.getElementById('state').value = state.trim();
    document.getElementById('country').value = country.trim();

    if(isLogin) {
        await getSalutationList()
        await getContactSalutationList()
        await getJobsList()
        await getRecruiterList()
        await getCandidateApplicationStatusList()
        await findCompany()
        await getCandidateStatusList()
        await getContactStatusList()
    }

}

function getNameReceived(data) {
    document.getElementById('loginLinkedinName').value = data.name;
    document.getElementById('loginLinkedinEmail').value = data.email;
}

async function processAPI(query, method, token, body) {
    let data = null
    let parameters = {
        method,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }
    if(body) parameters.body = JSON.stringify(body)
    try {
        const req = await fetch(`${ENDPOINT}${query}`, parameters)
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
        console.log(e)
    }
    return data;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function convertDate(_date) {
    let date = new Date(_date);
    const month = (date.getUTCMonth()+1) < 10 ? '0'+(date.getUTCMonth()+1) : (date.getUTCMonth()+1)
    const day = date.getUTCDate() < 10 ? '0'+date.getUTCDate() : date.getUTCDate()
    const year = date.getUTCFullYear()
    const time = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
    const _createdAt = `${month}-${day}-${year} ${time}`
    return _createdAt
}

async function setExistCandidate(data) {
    const recruiter = data.recruiters ? `${data.recruiters[0].firstName} ${data.recruiters[0].lastName}` : ''
    
    const resumeResponse = await processAPI(`/candidates/${data.candidateId}/attachments`, 'GET', TOKEN)
    if(resumeResponse.items && resumeResponse.items[0]) {
        $("#userResumeText").html(`${resumeResponse.items[0].fileName}`)
    }

    $('#candidateId').val(`${data.candidateId}`);
    $('#userRecruiterText').html(`${recruiter ? `${recruiter}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${recruiter ? '' : 'editable'}` )
    $('#userSalutationText').html(`${data.salutation ? `${data.salutation}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${data.salutation ? '' : 'editable'}` )
    $('#userNameText').html(`${data.firstName} ${data.lastName}<i class="fas fa-pen editable-icon"></i>`);
    $('#userEmployerText').addClass( `${data.employment && data.employment.current && data.employment.current.employer ? '' : 'editable'}` )
    $('#userEmployerText').html(`${data.employment && data.employment.current && data.employment.current.employer ? `${data.employment.current.employer}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#userPositionText').addClass( `${data.employment && data.employment.current && data.employment.current.position ? '' : 'editable'}` )
    $('#userPositionText').html(`${data.employment && data.employment.current && data.employment.current.position ? `${data.employment.current.position}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#userEmailText').addClass( `${data.email ? '' : 'editable'}` )
    $('#userEmailText').html(`${data.email ? `${data.email}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#userPhoneText').html(`${data.phone ? `${data.phone}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${data.phone ? '' : 'editable'}` );
    $('#userMobileText').html(`${data.mobile ? `${data.mobile}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${data.mobile ? '' : 'editable'}` );
    $('#userCityText').addClass( `${data.address && data.address.city ? '' : 'editable'}` )
    $('#userCityText').html(`${data.address && data.address.city ? `${data.address.city}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#userStateText').addClass( `${data.address && data.address.state ? '' : 'editable'}` )
    $('#userStateText').html(`${data.address && data.address.state ? `${data.address.state}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#userCountryText').addClass( `${data.address && data.address.country ? '' : 'editable'}` )
    $('#userCountryText').html(`${data.address && data.address.country ? `${data.address.country}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    // $('#userStatusText').addClass( `${data.status ? '' : 'editable'}` )
    // $('#userStatusText').html(`${data.status ? data.status.name : 'Click to edit'}`);
    $('#userProfileText').html(`<a href="${JOB_ADDER_URL}/candidates/${data.candidateId}" target="_blank">View Profile</a>`);
    $('#userStatusText').html(`${data.status.name}`);


    const _createdAt = convertDate(data.createdAt)
    $('#userCreatedAtText').html(`${_createdAt}`);

    const _updatedAt = convertDate(data.updatedAt)
    $('#userUpdatedAtText').html(`${_updatedAt}`);
}

function setExistContact(data) {
    var owner = data.owner ? `${data.owner.firstName} ${data.owner.lastName}` : ''
    if(data.company && data.company.companyId) {
        $('#editContactCompanyID').val(data.company.companyId)
    }

    $('#contactId').val(`${data.contactId}`);
    $('#contactRecruiterText').html(`${owner ? `${owner}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${owner ? '' : 'editable'}` )
    $('#contactSalutationText').html(`${data.salutation ? `${data.salutation}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`).addClass( `${data.salutation ? '' : 'editable'}` )
    $('#contactNameText').html(`${data.firstName} ${data.lastName} <i class="fas fa-pen editable-icon"></i>`);
    $('#contactCompanyText').addClass( `${data.company && data.company.name ? '' : 'editable'}` ).html(`${data.company && data.company.name ? `${data.company.name}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#contactPositionText').addClass( `${data.position ? '' : 'editable'}` ).html(`${data.position ? `${data.position}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#contactEmailText').addClass( `${data.email ? '' : 'editable'}` )
    $('#contactEmailText').html(`${data.email ? `${data.email}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#contactPhoneText').addClass( `${data.phone ? '' : 'editable'}` )
    $('#contactPhoneText').html(`${data.phone ? `${data.phone}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#contactMobileText').addClass( `${data.mobile ? '' : 'editable'}` )
    $('#contactMobileText').html(`${data.mobile ? `${data.mobile}<i class="fas fa-pen editable-icon"></i>` : 'Click to edit'}`);
    $('#contactProfileText').html(`<a href="${JOB_ADDER_URL}/contacts/${data.contactId}" target="_blank">View Profile</a>`);
    $('#contactStatusText').html(`${data.status.name}`);

    const _createdAt = convertDate(data.createdAt)
    $('#contactCreatedAtText').html(`${_createdAt}`);

    const _updatedAt = convertDate(data.updatedAt)
    $('#contactUpdatedAtText').html(`${_updatedAt}`);
}

function candidateNoteTypes(data) {
    let options = ''
    const _noteType = data.map(item => {
        options += `<option value="${item.name}">${item.name}</option>`
    })
    $('#noteType').append(options)
}

function contactNoteTypes(data) {
    let options = ''
    const _noteType = data.map(item => {
        options += `<option value="${item.name}">${item.name}</option>`
    })
    $('#contactNoteTypes').append(options)
}

function candidateNotesList(data) {
    let options = ''
    const _notesList = data.map(item => {
        const _createdAt = convertDate(item.createdAt)
        options += `<div class="card text-center note-card mb-2">
                        <div class="card-body">
                            <h5 class="card-title text-left">${item.type}</h5>
                            <p class="card-text text-left">${item.note}</p>
                        </div>
                        <div class="card-footer text-muted text-right">
                            ${item.createdBy} on ${_createdAt}
                        </div>
                    </div>`
    })
    $('#candidate-notes').html(options)
}

function contactNotesList(data) {
    let options = ''
    const _notesList = data.map(item => {
        const _createdAt = convertDate(item.createdAt)
        options += `<div class="card text-center note-card mb-2">
                        <div class="card-body">
                            <h5 class="card-title text-left">${item.type}</h5>
                            <p class="card-text text-left">${item.note}</p>
                        </div>
                        <div class="card-footer text-muted text-right">
                            ${item.createdBy} on ${_createdAt}
                        </div>
                    </div>`
    })
    $('#contact-notes').html(options)
}

function multipleSearch(data, name) {
    let htmlList = ''
    let count = 1
    let searchText = name
    $("#login-page").css('display', 'none')
    $("#new-user-page").css('display', 'none')
    $("#existing-user-page").css('display', 'none')
    $("header").css('display', 'block')
    $("#multiple-search-candidate").css('display', 'block')
    $(".multiple-search-candidate__btn").css('display', 'block')
    $('#found-records-msg').css('display', 'block').html(`Found ${data.length} records matching "${searchText}"`)
    for (const item of data) {
        const candidate_position = item.employment && item.employment.current && item.employment.current.position ? item.employment.current.position : ''
        const candidate_employer = item.employment && item.employment.current && item.employment.current.employer ? item.employment.current.employer : ''
        
        const contact_position = item.position ? item.position : ''
        const contact_employer = item.company && item.company.name ? item.company.name : ''

        const phone = item.phone ? item.phone : ''
        const status = item.status && item.status.name ? item.status.name : ''
        const updatedAt = convertDate(item.updatedAt)
        htmlList += `<div class="card">
            <div class="card-header" id="headingOne">
                <h5 class="mb-0">
                    <button class="btn btn-link" data-toggle="collapse" data-target="#${item.candidateId ? item.candidateId : item.contactId}" aria-expanded="true" aria-controls="$${item.candidateId ? item.candidateId : item.contactId}">
                    <i class="fas fa-chevron-down"></i> ${item.firstName} ${item.lastName}
                    </button>
                    <span class="${item.candidateId ? 'candidate-span' : 'contact-span'}">${item.candidateId ? 'Candidate' : 'Contact'}</span>
                </h5>
            </div>
        
            <div id="${item.candidateId ? item.candidateId : item.contactId}" class="collapse ${count == 1 ? 'show' : ''}" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body d-flex justify-content-start flex-column">
                <input type="hidden" class="form-control" id="${item.candidateId ? 'multiple-candidateId' : 'multiple-contactId'}" aria-label="${item.candidateId ? 'multiple-candidateId' : 'multiple-contactId'}" aria-describedby="basic-addon1" value="${item.candidateId ? item.candidateId : item.contactId}">
                <div class="form-group row">
                    <label for="inputEmail3" class="col-5 col-form-label">Current Position:</label>
                    <div class="col-7">
                        <label for="inputEmail3" class="col-form-label" id="multiple-candidate-position">${item.candidateId ? candidate_position : contact_position}</label>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputEmail3" class="col-5 col-form-label">Current Employer:</label>
                    <div class="col-7">
                        <label for="inputEmail3" class="col-form-label" id="multiple-candidate-employer">${item.candidateId ? candidate_employer : contact_employer}</label>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputEmail3" class="col-5 col-form-label">Phone:</label>
                    <div class="col-7">
                        <label for="inputEmail3" class="col-form-label" id="multiple-candidate-phone">${phone}</label>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputEmail3" class="col-5 col-form-label">Status:</label>
                    <div class="col-7">
                        <label for="inputEmail3" class="col-form-label" id="multiple-candidate-status">${status}</label>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="inputEmail3" class="col-5 col-form-label">Last Updated:</label>
                    <div class="col-7">
                        <label for="inputEmail3" class="col-form-label" id="multiple-candidate-updated">${updatedAt}</label>
                    </div>
                </div>
                <button role="button" class="btn ${item.candidateId ? 'btn-success' : 'btn-danger'} btn-sm align-self-start mb-2" id="${item.candidateId ? 'multiple-candidate-select-record' : 'multiple-contact-select-record'}">Select this record</button>
            </div>
            </div>
        </div>`
        count++
    }
    $('#accordion').css('display', 'block').html(htmlList) 
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

    $(".trial-period").text(`${d} days left on trial period`)
}


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.method == "getWord"){
        $("#login-page").css('display', 'none')
        $('#searching').css('display', 'none')
        $("header").css('display', 'block')
        $("#new-user-page").css('display', 'block')
        $("#existing-user-page").css('display', 'none')
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "userExist"){
        $("#login-page").css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $('#searching').css('display', 'none')
        $("header").css('display', 'block')
        $("#existing-user-page").css('display', 'block')
        $('#existing-user-page .tab-content').css('display', 'block')

        setExistCandidate(message.user)

        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "contactExist") {
        $("#login-page").css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $("#existing-user-page").css('display', 'none')
        $('#searching').css('display', 'none')
        $("header").css('display', 'block')
        $("#existing-contact-page").css('display', 'block')
        $('#existing-contact-page .tab-content').css('display', 'block')
        
        setExistContact(message.contact)

        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "not-logged-in"){
        $('#searching').css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $("#existing-user-page").css('display', 'none')
        $(".trial-period").css('display', 'none')
        $("#login-page").css('display', 'block')
        $("header").css('display', 'block')
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "noteTypes"){
        candidateNoteTypes(message.noteTypes)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "contactNoteTypes"){
        contactNoteTypes(message.noteTypes)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "notesList"){
        candidateNotesList(message.notesList)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "contactNotesList"){
        contactNotesList(message.notesList)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if(message.method == "Searching"){
        if(message.action == "start") $('#searching').css('display', 'block').find('h6').html(`Searching for ${message.name} <i class="fas fa-spinner fa-spin"></i>`)
        else $('#searching').css('display', 'none')
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if (message.method == "multipleSearch") {
        multipleSearch(message.list, message.searchText)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if (message.method == "signout") {
        $(".signout").css('display', 'none')
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if (message.method == "verifyLicenceFailure") {
        $('#existing-user-page .tab-content').css('display', 'none')
        $('#existing-contact-page .tab-content').css('display', 'none')
        $("#multiple-search-candidate").css('display', 'none')
        $("#existing-user-page").css('display', 'none')
        $("#existing-contact-page").css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $(".signout").css('display', 'none')
        $(".trial-period").css('display', 'none')
        $('#found-records-msg').css('display', 'none')
        $('#accordion').css('display', 'none')
        $(".multiple-search-candidate__btn").css("display", "none")

        $("header").css('display', 'block')
        $("#login-page").css('display', 'block')
        $('#login-error-msg').css('display', 'block').html("Subscription has expired. <a href='https://parsley-admin-prod.herokuapp.com/#/sign-up' target='_blank'>Click Here</a> to renew.");

        Promise.resolve("").then(result => sendResponse(result));
        return true;
    } else if (message.method == "setTrialPeriod") {
        $(".trial-period").css("display", "block").text(`${message.days} days left on trial period`)
        Promise.resolve("").then(result => sendResponse(result));
        return true;
    }
});

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    chrome.runtime.getBackgroundPage(function(eventPage) {
        eventPage.runContentScript();
        eventPage.getPageDetails(onPageDetailsReceived);
        eventPage.getName(getNameReceived);
    });
});

const form = document.querySelector(".form-data--login");
const handleLogin = async () => {
    $('#login-page .btn').html('Logging in...').prop('disabled', true);
    
    const name = document.getElementById('loginLinkedinName').value
    const linkedInEmail = document.getElementById('loginLinkedinEmail').value
    const email = $('#loginEmail').val()
    const password = $('#loginPassword').val()

    const result = await fetch(`${LOGIN_ENDPOINT}/user/login`, {
        method: "POST",
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({email, password})
    })
    const loginResponse = await result.json()

    if(loginResponse.data && loginResponse.data.accessToken && loginResponse.data.status == "allowed") {
        localStorage.setItem("access_token",loginResponse.data.accessToken);
        localStorage.setItem("jobadder_api_endpoint",loginResponse.data.jobAdderAPIUrl);
        localStorage.setItem("logged_in",true);
        localStorage.setItem("jobadder_access_token",loginResponse.data.ats.jobadder.accessToken);
        localStorage.setItem("user_id",loginResponse.data.ats.jobadder.userId);
        localStorage.setItem("user_email",loginResponse.data.email);
        localStorage.setItem("user_last_login",loginResponse.data.lastLogin);
        localStorage.setItem("user_next_billing",loginResponse.data.stripe.subscription.nextBilling);

        // compute trial remeaning
        if(loginResponse.data.stripe && loginResponse.data.stripe.subscription && loginResponse.data.stripe.subscription.nextBilling) setTrialDaysRemaining(loginResponse.data.stripe.subscription.nextBilling)
        
        window.ENDPOINT = loginResponse.data.jobAdderAPIUrl
        window.TOKEN = loginResponse.data.ats.jobadder.accessToken
        headers = {
            Accept: 'application/json',
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
        
        var searchCandidate = async () => {
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
            try {
                const foundCandidateResponse = await processAPI(`/candidates?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)
                const foundContactsResponse = await processAPI(`/contacts?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)
                
                $("header").css('display', 'block')
                $(".trial-period").css('display', 'block')
                if(!foundCandidateResponse.totalCount && !foundContactsResponse.totalCount) {
                    $("#login-page").css('display', 'none')
                    $("#new-user-page").css('display', 'block')
                    $("#existing-user-page").css('display', 'none')
                } else if (foundContactsResponse.totalCount == 1 && !foundCandidateResponse.totalCount) {
                    $("#login-page").css('display', 'none')
                    $("#new-user-page").css('display', 'none')
                    $("#existing-user-page").css('display', 'none')
                    $('#searching').css('display', 'none')
                    $("#existing-contact-page").css('display', 'block')
                    $("#existing-contact-page .select-record__spinnner").css("display", "flex")

                    const contactResponse = await processAPI(`/contacts/${foundContactsResponse.items[0].contactId}`, 'GET', TOKEN)
                    contactDetails = contactResponse

                    // integrate exist contact
                    setExistContact(contactDetails)
                    $('#existing-contact-page .tab-content').css('display', 'block')
                    $("#existing-contact-page .select-record__spinnner").css("display", "none")

                    // get contact note types
                    const contactNoteTypesResponse = await processAPI(`/contacts/lists/notetype`, 'GET', TOKEN)
                    contactNoteTypes(contactNoteTypesResponse.items)

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

                        contactNotesList(contactNotesArr)
                    }
                } else if (foundCandidateResponse.totalCount == 1 && !foundContactsResponse.totalCount) {
                    $("#login-page").css('display', 'none')
                    $("#new-user-page").css('display', 'none')
                    $('#searching').css('display', 'none')
                    $("#existing-user-page").css('display', 'block')
                    $("#existing-user-page .select-record__spinnner").css("display", "flex")

                    const candidateResponse = await processAPI(`/candidates/${foundCandidateResponse.items[0].candidateId}`, 'GET', TOKEN)
                    userDetails = candidateResponse

                    setExistCandidate(userDetails)
                    $('#existing-user-page .tab-content').css('display', 'block')
                    $("#existing-user-page .select-record__spinnner").css("display", "none")
                    
                    // get note types
                    const noteTypesResponse = await processAPI(`/candidates/lists/notetype`, 'GET', TOKEN)

                    candidateNoteTypes(noteTypesResponse.items)
                    
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

                        candidateNotesList(candidateNotesArr)
                    }
                } else if ((foundCandidateResponse.totalCount > 1 || foundContactsResponse.totalCount > 1) || (foundCandidateResponse.totalCount == 1 && foundContactsResponse.totalCount == 1)) {
                    $("#login-page").css('display', 'none')
                    $("#multiple-search-candidate").css('display', 'block')
                    $("#multiple-search-candidate .select-record__spinnner").css("display", "flex")
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
                    multipleSearch(result, name)
                    $(".multiple-search-candidate__btn").css("display", "block")
                    $("#multiple-search-candidate .select-record__spinnner").css("display", "none")
                }
                
                $(".signout").css('display', 'inline-block')
                $('#login-page .btn').html('Log In').prop('disabled', false);

                await getSalutationList()
                await getContactSalutationList()
                await getJobsList()
                await getRecruiterList()
                await getCandidateApplicationStatusList()
                await findCompany()
                await getCandidateStatusList()
                await getContactStatusList()
            } catch (error) {
                console.log(error)
            }
        }
        searchCandidate()
    } else {
        $('#login-page .btn').html('Log In').prop('disabled', false);
        if(loginResponse.data && loginResponse.data.status == "expired") {
            $('#login-error-msg').css('display', 'block').html("Subscription has expired.");
        } else if (loginResponse.data && loginResponse.data.status !== "allowed" && loginResponse.data.status !== "expired") {
            $('#login-error-msg').css('display', 'block').html("User not allowed.");
        } else {
            $('#login-error-msg').css('display', 'block').html(loginResponse.message);
        }
    }
    
};
// declare a function to handle form submission
const handleLoginSubmit = async e => {
  e.preventDefault();
  handleLogin();
};
if($('.form-data--login').length !== 0) form.addEventListener("submit", e => handleLoginSubmit(e));

// select from multiple candidate infos
$("body").on("click","#multiple-candidate-select-record",function(e) {
    var getSelectedCandidateInfo = async () => {
        $("#login-page").css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $("#multiple-search-candidate").css('display', 'none')
        $("#existing-user-page").css('display', 'block')
        $("#candidate-back-btn").css('display', 'block')
        let candidateId = $(this).closest('.card-body').find('#multiple-candidateId').val()
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
        try {
            $('#existing-user-page .select-record__spinnner').css('display', 'flex')
            const candidateResponse = await processAPI(`/candidates/${candidateId}`, 'GET', TOKEN)
            userDetails = candidateResponse
    
            $("#login-page").css('display', 'none')
            $("#new-user-page").css('display', 'none')
            $("#existing-user-page").css('display', 'block')

            setExistCandidate(userDetails)
            $('#existing-user-page .select-record__spinnner').css('display', 'none')
            $('#existing-user-page .tab-content').css('display', 'block')

            // get note types
            const noteTypesResponse = await processAPI(`/candidates/lists/notetype`, 'GET', TOKEN)
            candidateNoteTypes(noteTypesResponse.items)
    
            // get candidate notes
            let noteTypesArr = []
            for (const item of noteTypesResponse.items) {
                noteTypesArr.push(item.name)
            }
            if(userDetails.candidateId) {
                const candidateNotesResponse = await processAPI(`/candidates/${candidateId}/notes`, 'GET', TOKEN)

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
                candidateNotesList(candidateNotesArr)
            }
        } catch (error) {
            console.log(error)
        }
    }
    getSelectedCandidateInfo()
});

// select from multiple contact infos
$("body").on("click","#multiple-contact-select-record",function(e) {
    var getSelectedCandidateInfo = async () => {
        $("#login-page").css('display', 'none')
        $("#new-user-page").css('display', 'none')
        $("#multiple-search-candidate").css('display', 'none')
        $("#existing-contact-page").css('display', 'block')
        $("#contact-back-btn").css('display', 'block')
        let contactId = $(this).closest('.card-body').find('#multiple-contactId').val()
        let contactDetails = {
            firstName: '',
            lastName: '',
            position: '',
            email: '',
            phone: '',
            mobile: '',
            createdAt: '',
            updatedAt: ''
        }
        try {
            $('#existing-contact-page .select-record__spinnner').css('display', 'flex')

            const contactResponse = await processAPI(`/contacts/${contactId}`, 'GET', TOKEN)
            contactDetails = contactResponse

            // integrate exist contact
            setExistContact(contactDetails)
            $('#existing-contact-page .select-record__spinnner').css('display', 'none')
            $('#existing-contact-page .tab-content').css('display', 'block')
            
            // get note types
            const noteTypesResponse = await processAPI(`/contacts/lists/notetype`, 'GET', TOKEN)
            contactNoteTypes(noteTypesResponse.items)
    
            // get candidate notes
            let noteTypesArr = []
            for (const item of noteTypesResponse.items) {
                noteTypesArr.push(item.name)
            }
            if(contactDetails.contactId) {
                const contactNotesResponse = await processAPI(`/contacts/${contactId}/notes`, 'GET', TOKEN)
    
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
                contactNotesList(contactNotesArr)
            }
        } catch (error) {
            console.log(error)
        }
    }
    getSelectedCandidateInfo()
}); 


// add candidate notes
const form3 = document.querySelector(".form-data--notes");
const addNotes = async e => {
    e.preventDefault();
    const candidateId = document.getElementById('candidateId').value
    const noteType = document.getElementById('noteType').value
    const note = document.getElementById('note').value

    try {
        $(".form-data--notes button.btn").text("Adding").prop('disabled', true);
        $('#candidate-notes').html("<i class='fas fa-spinner fa-spin'>")

        await processAPI(`/candidates/${candidateId}/notes`, 'POST', TOKEN, {type: noteType, text: note})

        // get note types
        const noteTypesResponse = await processAPI(`/candidates/lists/notetype`, 'GET', TOKEN)
        let noteTypesArr = []
        for (const item of noteTypesResponse.items) {
            noteTypesArr.push(item.name)
        }

        // notes list
        const candidateNotesResponse = await processAPI(`/candidates/${candidateId}/notes`, 'GET', TOKEN)
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
        candidateNotesList(candidateNotesArr)
        $(".form-data--notes button.btn").text("Add Note").prop('disabled', false);
    }  catch (error) {
        console.log(error)
    }
};
form3.addEventListener("submit", e => addNotes(e));

// add contact notes
const contactForm = document.querySelector(".form-data--notes-contact");
const addContactNotes = async e => {
    e.preventDefault();
    const contactId = document.getElementById('contactId').value
    const noteType = document.getElementById('contactNoteTypes').value
    const note = document.getElementById('contactNote').value

    try {
        $(".form-data--notes-contact button.btn").text("Adding").prop('disabled', true);
        $('#contact-notes').html("<i class='fas fa-spinner fa-spin'>")
        await processAPI(`/contacts/${contactId}/notes`, 'POST', TOKEN, {type: noteType, text: note})

        // get note types
        const noteTypesResponse = await processAPI(`/contacts/lists/notetype`, 'GET', TOKEN)

        let noteTypesArr = []
        for (const item of noteTypesResponse.items) {
            noteTypesArr.push(item.name)
        }

        // notes list
        const contactNotesResponse = await processAPI(`/contacts/${contactId}/notes`, 'GET', TOKEN)
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
        contactNotesList(contactNotesArr)
        $(".form-data--notes-contact button.btn").text("Adding").prop('disabled', false);

    }  catch (error) {
        console.log(error)
    }
};
contactForm.addEventListener("submit", e => addContactNotes(e));

// add candidate
const form4 = document.querySelector(".form-data--add-candidate");
const addCandidate = async e => {
    e.preventDefault();
    
    var linkedin = document.getElementById('linkedInUrl').value
    var twitter = document.getElementById('twitterUrl').value
    var facebook = document.getElementById('facebookUrl').value
    var source = document.getElementById('candidateSource').value
    var salutation = document.getElementById('salutation').value
    var recruiterUserId = document.getElementById('recruiter').value
    var firstName = document.getElementById('firstName').value
    var lastName = document.getElementById('lastName').value
    var currentEmployer = document.getElementById('currentEmployer').value
    var currentPosition = document.getElementById('currentPosition').value
    var email = document.getElementById('email').value
    var phone = document.getElementById('phone').value
    var mobile = document.getElementById('mobile').value
    var city = document.getElementById('city').value
    var state = document.getElementById('state').value
    var country = document.getElementById('country').value.trim()
    var statusId = document.getElementById('status').value
    var candidateStatus = document.getElementById('candidateStatus').value
    
    const data = {
        firstName,
        lastName,
        phone,
        mobile,
        source,
        address: {
            city,
            state,
        },
        employment: {
            current: {
                employer: currentEmployer,
                position: currentPosition
            }
        },
        social: {
            linkedin
        }
    }

    if(twitter) data.social.twitter = twitter
    if(facebook) data.social.facebook = facebook
    if(recruiterUserId !== "default") data.recruiterUserId = [recruiterUserId]
    if(salutation !== "default") data.salutation = salutation
    if(candidateStatus !== "default") data.statusId = candidateStatus
    
    var error_fields = []

    // validate fields
    if(email) {
        if(validateEmail(email)){
            data.email = email
            $("#candidate-email-field").removeClass("validation-error-field")
            $('#email-validation-err').css({'display': 'none'})
        } else {
            $("#candidate-email-field").addClass("validation-error-field")
            $('#email-validation-err').css({'display': 'block'})
            error_fields.push("email")
        }
    }

    // country validation
    if(country) {
        const _countries = await $.getJSON("./countries.json", function(data){
            return data
        }).fail(function(){
            console.log("An error has occurred.");
        });
        const countryCode = _countries.find(item => item.name == country)

        if(countryCode) {
            data.address.countryCode = countryCode.code
            $("#candidate-country-field").removeClass("validation-error-field")
            $('#country-validation-err').css({'display': 'none'})
        } else {
            $("#candidate-country-field").addClass("validation-error-field")
            $('#country-validation-err').css({'display': 'block'})
            error_fields.push("country")
        }
    }

    // resume upload validation
    let resume_upload = false
    if($('#uploadResume').val()) {
        var file = $("#uploadResume").val();
        var file_extension = file ? file.split('.').pop() : "pdf"
        var ext_allowed = ["pdf", "docx", "doc", "txt"]
        if(!ext_allowed.includes(file_extension)){
            // $('.form-data--add-candidate .alert-danger').css({'display': 'flex'}).html('File type is not allowed!')
            $("#candidate-resume-field").addClass("validation-error-field")
            $('#resume-validation-err').css({'display': 'block'})
            error_fields.push("resume_upload")
        } else {
            $("#candidate-resume-field").removeClass("validation-error-field")
            $('#resume-validation-err').css({'display': 'none'})
            resume_upload = true
        }
    }

    if(error_fields.length) return false;
    try {
        $('.form-data--add-candidate .btn-success').html("Creating").prop('disabled', true);
        const response = await processAPI(`/candidates`, 'POST', TOKEN, data)
        const candidateId = response.candidateId

        if(!candidateId) {
            $('.form-data--add-candidate .alert-danger').css({'display': 'flex'}).html(`${response.message} <i class="exist-candidate-error fas fa-times"></i>`)
            return false
        }

        // upload resume file
        let uploadResumeResponse = {}
        if(resume_upload && candidateId) {
            var formData = new FormData();
            var file_resume = $('#uploadResume')[0].files;
            formData.append('fileData', file_resume[0]);

            const uploadResume = await fetch(`${ENDPOINT}/candidates/${candidateId}/attachments/Resume`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
                body: formData
            })
            uploadResumeResponse = await uploadResume.json()
        } 

        // add candidate to a job
        const _candidateId = [candidateId]
        const _data = {
            candidateId: _candidateId,
            source
        }
        const jobId = document.getElementById('addToJob').value
        if(jobId !== "default") {
            const jobApplicationResponse = await processAPI(`/jobs/${jobId}/applications`, 'POST', TOKEN, _data)
            const result = jobApplicationResponse.items.find(item => item.candidate.candidateId == _candidateId)

            if(statusId !== "default") {
                await processAPI(`/applications/${result.applicationId}/status`, 'PUT', TOKEN, {statusId})
            }
        }

        if(response.hasOwnProperty('errors')) {
            $('.form-data--add-candidate .alert-danger.success-msg').css({'display': 'flex'}).html(`${response.message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>`)
            $('.form-data--add-candidate .btn-success').html("Create Candidate").prop('disabled', false);
        } else {
            await setExistCandidate(response)
            $('.form-data--add-candidate .btn-success').html("Create Candidate").prop('disabled', false);
            $('#new-user-page').css('display', 'none')
            $('#existing-user-page').css('display', 'block')
            $("#existing-user-page .tab-content").css('display', 'block')

            $('#added-record-success').css({'display': 'flex'}).html('Candidate created successfully! <i class="added-record-success__exit fas fa-times"></i>')

                // get note types
                const noteTypesResponse = await processAPI(`/candidates/lists/notetype`, 'GET', TOKEN)
                candidateNoteTypes(noteTypesResponse.items)
    
                // notes list
                let noteTypesArr = []
                for (const item of noteTypesResponse.items) {
                    noteTypesArr.push(item.name)
                }
                const candidateNotesResponse = await processAPI(`/candidates/${candidateId}/notes`, 'GET', TOKEN)
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
                candidateNotesList(candidateNotesArr)
        } 
        
        
    }  catch (error) {
        console.log(error)
    }
};
form4.addEventListener("submit", e => addCandidate(e));


// add contact
const form5 = document.querySelector(".form-data--add-contact");
const addContact = async e => {
    e.preventDefault();
    
    var salutation = document.getElementById('contactSalutation').value
    var ownerUserId = document.getElementById('owner').value
    var firstName = document.getElementById('contactFirstName').value
    var lastName = document.getElementById('contactLastName').value
    var companyId = document.getElementById('contactCompanyID').value
    var company = document.getElementById('contactCompany').value
    var position = document.getElementById('contactPosition').value
    var email = document.getElementById('contactEmail').value
    var phone = document.getElementById('contactPhone').value
    var mobile = document.getElementById('contactMobile').value
    var status = document.getElementById('contactStatus').value

    const data = {
        firstName,
        lastName,
        email,
        phone,
        mobile,
        position
    }

    if(ownerUserId !== "default") data.ownerUserId = ownerUserId
    if(salutation !== "default") data.salutation = salutation
    if(status !== "default") data.statusId = status
    if(companyId) data.companyId = companyId

    try {
        $('.form-data--add-contact .btn-success').html("Creating").prop('disabled', true);
        // if(!companyId){
        //     const companyResponse = await processAPI(`/companies`, 'POST', TOKEN, {name: company})
        //     data.companyId = companyResponse.companyId
        // } else data.companyId = companyId

        const response = await processAPI(`/contacts`, 'POST', TOKEN, data)

        if(response.hasOwnProperty('errors')) {
            $('.form-data--add-contact .alert-danger').css({'display': 'flex'}).html(`${response.message} <i class="exist-contact-error fas fa-times"></i>`)
            $('.form-data--add-contact .btn-success').html("Create Contact").prop('disabled', false);
            return false
        } else {
            $('.form-data--add-contact .btn-success').html("Create Contact").prop('disabled', false);
            $('#new-user-page').css('display', 'none')
            setExistContact(response)
            $('#existing-contact-page').css('display', 'block')
            $("#existing-contact-page .tab-content").css('display', 'block')

            $('#added-record-success').css({'display': 'flex'}).html('Contact created successfully! <i class="added-record-success__exit fas fa-times"></i>')

            // get note types
            const noteTypesResponse = await processAPI(`/contacts/lists/notetype`, 'GET', TOKEN)
            contactNoteTypes(noteTypesResponse.items)

            // notes list
            let noteTypesArr = []
            for (const item of noteTypesResponse.items) {
                noteTypesArr.push(item.name)
            }
            const contactNotesResponse = await processAPI(`/contacts/${response.contactId}/notes`, 'GET', TOKEN)
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
            contactNotesList(contactNotesArr)
        }

    }  catch (error) {
        console.log(error)
    }
};
form5.addEventListener("submit", e => addContact(e));



// ****************** CLICK EVENTS ********************


// enable click event for appended element
$(document).on('click', '.added-record-success__exit', function() {
    $("#added-record-success").css("display", "none")
}) ;

$(document).on('click', '.exist-candidate-error', function() {
    $("#added-record-danger").css("display", "none")
    $(".form-data--user-profile .alert-danger").css("display", "none")
    $('.form-data--add-candidate .btn-success').html("Create Candidate").prop('disabled', false);
}) ;

$(document).on('click', '.exist-contact-error', function() {
    $(".form-data--add-contact .alert-danger").css("display", "none")
    $('.form-data--add-contact .btn-success').html("Create Contact").prop('disabled', false);
}) ;

// click contact tab
$('.create-company').click(function() {
    $('#contactCompany').select();
    document.execCommand("copy");
    $(this).html("Copied")
})


$('#create-new-record-candidate').click(async function(){
    $("#login-page").css('display', 'none')
    $("#multiple-search-candidate").css('display', 'none')
    $("#existing-user-page").css('display', 'none')
    $("#existing-contact-page").css('display', 'none')
    $("#new-user-page").css('display', 'block')
})

$('#create-new-record-contact').click(async function(){
    $("#login-page").css('display', 'none')
    $("#multiple-search-candidate").css('display', 'none')
    $("#existing-user-page").css('display', 'none')
    $("#existing-contact-page").css('display', 'none')
    $("#new-user-page").css('display', 'block')
})

$('#candidate-back-btn').click(async function(){
    $('#existing-user-page .tab-content').css('display', 'none')
    $('header').css('display', 'none')
    const name = $("#loginLinkedinName").val() !== "undefined" ? $("#loginLinkedinName").val() : ''
    const linkedInEmail = $("#loginLinkedinEmail").val() !== "undefined" ? $("#loginLinkedinEmail").val() : ''

    $("#existing-user-page").css('display', 'none')
    $('#searching').css('display', 'block').find('h6').html(`Searching for ${name} <i class="fas fa-spinner fa-spin"></i>`)

    const foundCandidateResponse = await processAPI(`/candidates?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)
    const foundContactsResponse = await processAPI(`/contacts?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)
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
    multipleSearch(result, name)

    $("#searching").css('display', 'none')
    $('header').css('display', 'block')
    $("#multiple-search-candidate").css('display', 'block')
})

$('#contact-back-btn').click(async function(){
    $('#existing-contact-page .tab-content').css('display', 'none')
    $('header').css('display', 'none')

    const name = $("#loginLinkedinName").val() !== "undefined" ? $("#loginLinkedinName").val() : ''
    const linkedInEmail = $("#loginLinkedinEmail").val() !== "undefined" ? $("#loginLinkedinEmail").val() : ''

    $("#existing-contact-page").css('display', 'none')
    $('#searching').css('display', 'block').find('h6').html(`Searching for ${name} <i class="fas fa-spinner fa-spin"></i>`)

    const foundCandidateResponse = await processAPI(`/candidates?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)
    const foundContactsResponse = await processAPI(`/contacts?name=${name}&email=${linkedInEmail}`, 'GET', TOKEN)

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
    multipleSearch(result, name)

    $("#searching").css('display', 'none')
    $('header').css('display', 'block')
    $("#multiple-search-candidate").css('display', 'block')
})

$('.multiple-search-candidate__btn').click(async function(){
    $("#login-page").css('display', 'none')
    $("#multiple-search-candidate").css('display', 'none')
    $("#existing-user-page").css('display', 'none')
    $("#existing-contact-page").css('display', 'none')
    $("#new-user-page").css('display', 'block')
})

// close popup
$('i.close-popup').click(() => {
    window.close();
})

$('i.signout').click(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("jobadder_api_endpoint");
    localStorage.removeItem("logged_in");
    localStorage.removeItem("jobadder_access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_last_login");
    localStorage.removeItem("user_next_billing");

    $('#existing-user-page .tab-content').css('display', 'none')
    $('#existing-contact-page .tab-content').css('display', 'none')
    $("#multiple-search-candidate").css('display', 'none')
    $("#existing-user-page").css('display', 'none')
    $("#existing-contact-page").css('display', 'none')
    $("#new-user-page").css('display', 'none')
    $(".signout").css('display', 'none')
    $(".trial-period").css('display', 'none')
    $('#found-records-msg').css('display', 'none')
    $('#accordion').css('display', 'none')
    $(".multiple-search-candidate__btn").css("display", "none")
    $("#login-page").css('display', 'block')
})

// DOUBLE CLICK 
$('.col-8 .is-edit').click(function() {
    if($(this).text() == "Click to edit") {
        $(this).css('display', 'none');
        $(this).next( ".input-group" ).css('display', 'flex');
    } else {
        const value = $(this).text()
        $(this).css('display', 'none');
        $(this).next( ".input-group" ).css('display', 'flex').find('input').val(value);
        if($(this).attr('id') == 'userNameText'|| $(this).attr('id') == 'contactNameText') {
            const name = value.trim().split(" ")
            let firstName = ""
            let lastName = ""
            let count = 0
            for (const item of name) {
                if(name.length - 1 !== count) firstName += `${item} `
                else lastName += `${item} `
                count++
            }
        
            $(this).css('display', 'none');
            $(this).closest('.col-8').find('.user-first-name').css({'display': 'flex', 'margin-bottom': '5px'}).find('input').val(firstName.trim())
            $(this).closest('.col-8').find('.user-last-name').css('display', 'flex').find('input').val(lastName.trim());
        } else {
            $(this).css('display', 'none');
            $(this).next( ".input-group" ).css('display', 'flex').find('input').val(value);
        }
    }
})

// submit edit input
$('.input-group-append .check').click(async function () {
    const field_name = $(this).closest('.input-group').find('input').attr('id')
    const select_field_name = $(this).closest('.input-group').find('select').attr('id')
    const field_value = $(this).closest('.input-group').find('input').val()
    const select_field_value = $(this).closest('.input-group').find('select').val()

    const candidateId = $("#candidateId").val()
    const contactId = $("#contactId").val()

    let data = {}


    if($("#existing-contact-page").is(':visible')) {
        if (field_name == "contactCompany") {
            const editContactCompanyID = $("#editContactCompanyID").val()
            data.name = field_value
            try {
                $(this).html('<i class="fas fa-spinner fa-spin"></i>')
                const result = await fetch(`${ENDPOINT}/companies/${editContactCompanyID}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(data)
                })
                const response = await result.json()
                $(this).html('<i class="fas fa-check"></i>')
                $(this).closest('.col-8').find('.col-form-label').removeClass( "editable" )
                $(this).closest('.input-group').css('display', 'none')
                $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(response.name)

                await findCompany()

            } catch (error) {
                console.log(error)
            }
        } else {
            if(select_field_name == "contactRecruiter") data.ownerUserId = parseInt(select_field_value)
            else if(select_field_name == "editContactSalutation") data.salutation = select_field_value
            else {
                switch (field_name) {
                    case "contactFirstName":
                        data.firstName = field_value
                        break;
        
                    case "contactLastName":
                        data.lastName = field_value
                        break;
        
                    case "contactPosition":
                        data.position = field_value
                        break;
            
                    case "contactEmail":
                        data.email = field_value
                        break;
                    
                    case "contactPhone":
                        data.phone = field_value
                        break;
                    
                    case "contactMobile":
                        data.mobile = field_value
                        break;
                    
                    default:
                        break;
                }
            }
            const updateContactFields = async e => {
                try {
                    $(this).html('<i class="fas fa-spinner fa-spin"></i>')
                    const result = await fetch(`${ENDPOINT}/contacts/${contactId}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify(data)
                    })
                    const response = await result.json()
                    $(this).html('<i class="fas fa-check"></i>')
                    
                    if($(this).closest('.col-8').find('.col-form-label').attr('id') == "contactNameText") {
                        $(this).closest('.input-group').css('display', 'none')
                        if( $(this).closest('.col-8').find('.user-first-name').is(':hidden') &&  $(this).closest('.col-8').find('.user-last-name:hidden').is(':hidden')) {
                            $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${response.firstName} ${response.lastName}<i class="fas fa-pen editable-icon"></i>`)
                        }
                    } else {
                        const owner = (select_field_name == "contactRecruiter" && response.owner) ? `${response.owner.firstName} ${response.owner.lastName}` : ''
                        const salutation = (select_field_name == "editContactSalutation" && response.salutation) ? `${response.salutation}` : ''

                        if(owner) {
                            $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${owner}<i class="fas fa-pen editable-icon"></i>`)
                        } else if(salutation) {
                            $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${salutation}<i class="fas fa-pen editable-icon"></i>`)
                        } else {
                            $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${field_value}<i class="fas fa-pen editable-icon"></i>`)
                        }

                        // $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${owner ? `${owner}<i class="fas fa-pen editable-icon"></i>` : field_value }`)
                        $(this).closest('.col-8').find('.col-form-label').removeClass( "editable" )
                        $(this).closest('.input-group').css('display', 'none')
                    }
        
                }  catch (error) {
                    console.log(error)
                }
            };
            updateContactFields()
        }
    } else {
        if (select_field_name == "userRecruiter") data.recruiterUserId = [parseInt(select_field_value)]
        else if (select_field_name == "userStatus") data.statusId = parseInt(select_field_value)
        else if (select_field_name == "userSalutation") data.salutation = select_field_value
        else {
            switch (field_name) {
                case "userFirstName":
                    data.firstName = field_value
                    break;
    
                case "userLastName":
                    data.lastName = field_value
                    break;
    
                case "userEmployer":
                    data = {
                        employment: {
                            current: {
                                employer: field_value
                            }
                        }
                    }
                    break;
        
                case "userPosition":
                    data = {
                        employment: {
                            current: {
                                position: field_value
                            }
                        }
                    }
                    break;
        
                case "userEmail":
                    data.email = field_value
                    break;
                
                case "userPhone":
                    data.phone = field_value
                    break;
                
                case "userMobile":
                    data.mobile = field_value
                    break;
                
                case "userCity":
                    data = {
                        address: {
                            city: field_value
                        }
                    }
                    break;
        
                case "userState":
                    data = {
                        address: {
                            state: field_value
                        }
                    }
                    break;
        
                case "userCountry":
                    const _countries = await $.getJSON("./countries.json", function(data){
                        return data
                    }).fail(function(){
                        console.log("An error has occurred.");
                    });
        
                    const countryCode = _countries.find(item => item.name == field_value)
                    if(!countryCode) {
                        $('.form-data--user-profile .alert-danger').css({'display': 'flex'}).html(`Country entered does not exist. <i class="exist-candidate-error fas fa-times"></i>`)
                        $(this).closest('.input-group').css('display', 'none')
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block')
                        return false
                    }
                    data = {
                        address: {
                            countryCode: countryCode.code
                        }
                    }
                    break;
        
                default:
                    break;
            }
        }

        const updateCandidateField = async e => {
            try {
                $(this).html('<i class="fas fa-spinner fa-spin"></i>')
                const result = await fetch(`${ENDPOINT}/candidates/${candidateId}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(data)
                })
                const response = await result.json()
                $(this).html('<i class="fas fa-check"></i>')
                
                if($(this).closest('.col-8').find('.col-form-label').attr('id') == "userNameText") {
                    $(this).closest('.input-group').css('display', 'none')
                    if( $(this).closest('.col-8').find('.user-first-name').is(':hidden') &&  $(this).closest('.col-8').find('.user-last-name:hidden').is(':hidden')) {
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${response.firstName} ${response.lastName}<i class="fas fa-pen editable-icon"></i>`)
                    }
                } else {
                    const recruiter = (select_field_name == "userRecruiter" && response.recruiters) ? `${response.recruiters[0].firstName} ${response.recruiters[0].lastName}` : ''
                    const status = (select_field_name == "userStatus" && response.status) ? `${response.status.name}` : ''
                    const salutation = (select_field_name == "userSalutation" && response.salutation) ? `${response.salutation}` : ''

                    if(recruiter) {
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${recruiter}<i class="fas fa-pen editable-icon"></i>`)
                    } else if (status) {
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${status}<i class="fas fa-pen editable-icon"></i>`)
                    }  else if (salutation) {
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${salutation}<i class="fas fa-pen editable-icon"></i>`)
                    } else {
                        $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${field_value}<i class="fas fa-pen editable-icon"></i>`)
                    }
                    $(this).closest('.col-8').find('.col-form-label').removeClass( "editable" )
                    $(this).closest('.input-group').css('display', 'none')
                }
    
                console.log(response)
            }  catch (error) {
                console.log(error)
            }
        };
        updateCandidateField()
    }

})

// close edit input
$('.input-group-append .exit-field').click(async function() {
    if($(this).closest('.col-8').find('.col-form-label').attr('id') == "userNameText" || $(this).closest('.col-8').find('.col-form-label').attr('id') == "contactNameText") {
        if( $(this).closest('.col-8').find('.user-first-name').is(':hidden') ||  $(this).closest('.col-8').find('.user-last-name:hidden').is(':hidden') ) {
            $(this).html('<i class="fas fa-spinner fa-spin"></i>')
            const candidateId = $("#candidateId").val()
            const contactId = $("#contactId").val()
            let response = {}
            if($("#existing-contact-page").is(':visible')) {
                response = await processAPI(`/contacts/${contactId}`, 'GET', TOKEN)
            } else {
                response = await processAPI(`/candidates/${candidateId}`, 'GET', TOKEN)
            }
            $(this).html('<i class="fas fa-times"></i>')
            $(this).closest('.input-group').css('display', 'none')
            $(this).closest('.col-8').find('.col-form-label').css('display', 'block').html(`${response.firstName} ${response.lastName}<i class="fas fa-pen editable-icon"></i>`)
        } else {
            $(this).closest('.input-group').css('display', 'none')
        }
    } else {
        $(this).closest('.input-group').css('display', 'none')
        $(this).closest('.col-8').find('.col-form-label').css('display', 'block')
    }
})


$('input[type="file"]').change(function(e){
    var fileName = e.target.files[0].name;
    $("#candidate-resume-field .custom-file span").html(`<i class="far fa-file"></i> ${fileName}`)
});

$('#addToJob').change(function(e){
    if($(this).val() == "default") $("#status").val("default").prop( "disabled", true );
    else $("#status").prop( "disabled", false );
});

const searchCompany = async (company) => {
    $(".contact-company-search-container").css("display", "block")
    if(company) {
        try {
            $(".contact-company-search-container").html(`<li id="searching-company"><i class="fas fa-spinner fa-spin"></i></li>`)
            const result = await fetch(`${ENDPOINT}/companies?name=${company}`, {
                method: "GET",
                headers
            })
            const response = await result.json()

            if(response.totalCount !== 0) {
                var company_list_html = ""
                for (const item of response.items) {
                    company_list_html += `<li class="item-company" data-id="${item.companyId}">${item.name}</li>`
                }
                $(".contact-company-search-container").html(company_list_html)
            } else {
                $(".contact-company-search-container").html(`<li id="searching-company-empty"><i class="fas fa-plus"></i> ${company} (Add New Company)</li>`)
            }
        }  catch (error) {
            console.log(error)
        }
    } else {
        $(".contact-company-search-container").css("display", "none")
        $("#contactCompanyID").val("")
    }
};

$("#contactCompany").keyup(function(){
    $(".contact-company-search-container").css("display", "block")
    const company = $(this).val()
    searchCompany(company)
});

$(document).on('click', '.contact-company-search-container li.item-company', function() {
    var selected_company_value = $(this).text()
    var selected_company_value_id = $(this).attr("data-id")

    $(".contact-company-search-container").css("display", "none")
    $("#contactCompanyID").val(selected_company_value_id)
    $("#contactCompany").val(selected_company_value)
})

$(document).on('click', '#searching-company-empty', async function() {
    const company = $("#contactCompany").val()
    $(".contact-company-search-container").html(`<li id="searching-company"><i class="fas fa-spinner fa-spin"></i></li>`)
    const companyResponse = await processAPI(`/companies`, 'POST', TOKEN, {name: company})
    $("#contactCompanyID").val(companyResponse.companyId)

    $(".contact-company-search-container").css("display", "none")
})

// $("#contactCompany").focusout(function() {
//     if(!$("#searching-company-empty").length){
//         $(".contact-company-search-container").css("display", "none")
//     }
// })

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
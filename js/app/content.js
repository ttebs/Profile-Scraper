
// functions
function linkedInLoadProfile (evt) {
    var profileName = $(".pv-top-card .t-24").length ? true : false
    chrome.runtime.sendMessage({"message": "activate_icon", "currentTab": window.location.href, "profileName" : profileName});
}

function githubLoadProfile (evt) {
    var profileName = $(".vcard-fullname").length ? true : false
    chrome.runtime.sendMessage({"message": "activate_icon", "currentTab": window.location.href, "profileName" : profileName});
}

function stackOverflowLoadProfile (evt) {
    var profileName = $(".profile-user--name div").length ? true : false
    chrome.runtime.sendMessage({"message": "activate_icon", "currentTab": window.location.href, "profileName" : profileName});
}

function angelListLoadProfile (evt) {
    var profileName = $("h1").length ? true : false
    chrome.runtime.sendMessage({"message": "activate_icon", "currentTab": window.location.href, "profileName" : profileName});
}

function indeedLoadProfile (evt) {
    var profileName = $("#main h1").length ? true : false
    chrome.runtime.sendMessage({"message": "activate_icon", "currentTab": window.location.href, "profileName" : profileName});
}

var searchUser = (name, email) => {
    chrome.runtime.sendMessage({
        type: "autoLogin",
        name: name.trim(),
        email: email.trim(),
    })
}



// ******* LINEKDIN *******
var site = window.location.href.includes('https://www.linkedin.com/')
if(site) {
    window.addEventListener ("load", linkedInLoadProfile, false);
    if($('a[href$="detail/contact-info/"]').length){
        $('a[href$="detail/contact-info/"]')[0].click()
        setTimeout(function() {
    
            let name = $( ".pv-top-card .t-24" ).text()
            let email = $( ".ci-email a" ).text()
            if ($( ".pv-top-card .t-24" ).text().indexOf(',') > -1) {
                name = $( ".pv-top-card .t-24" ).text().substr(0, $( ".pv-top-card .t-24" ).text().indexOf(','));
            }
            searchUser(name, email)
            
            var exp_position = $('.experience-section > ul li:first-child .pv-entity__summary-info').length ? $('.experience-section > ul li:first-child .pv-entity__summary-info h3').text() : $('.experience-section > ul li:first-child ul li:first-child h3 span:last-child').text()
            var exp_employer = $('.experience-section > ul li:first-child p.pv-entity__secondary-title').length ? $('.experience-section > ul li:first-child p.pv-entity__secondary-title').clone()
            .children()
            .remove()
            .end()
            .text() : $('.experience-section > ul li:first-child .pv-entity__company-summary-info h3 span:last-child').clone()
            .children()
            .remove()
            .end()
            .text()
    
            if(!exp_position && !exp_employer) {
                var positionAndEmployerText = $(".pv-text-details__left-panel .text-body-medium").text().trim()
                if(positionAndEmployerText.includes(" at ")) {
                    var positioAndEmployer = positionAndEmployerText.trim().split(" at ")
                    var position = positioAndEmployer[0]
                    var employer = positioAndEmployer[1]
                } else {
                    var position = positionAndEmployerText
                    var employer = ""
                }
            } else {
                var position = exp_position
                var employer = exp_employer
            }
    
            var address = $(".pv-top-card .pv-top-card__list-container ul.pv-top-card--list-bullet li:first-child").length ? $(".pv-top-card .pv-top-card__list-container ul.pv-top-card--list-bullet li:first-child").text() : $('.pv-top-card .pb2 span:first-child').text()
            chrome.runtime.sendMessage({
                'type': 'linkedinScrap',
                'fields': {
                    'name': name.trim(),
                    'position': position.trim().substr(0, 90),
                    'employer': employer.trim().substr(0, 90),
                    'address': address.trim(),
                    'email': $( ".ci-email a" ).text(),
                    'phone': $( ".ci-phone .pv-contact-info__ci-container span:first-child" ).text(),
                    'linkedInUrl': window.location.href.substr(0, window.location.href.indexOf("detail/contact-info/")),
                    'siteUrl': window.location.href
                }
            });
            $('#artdeco-modal-outlet').css('display', 'none')
            $("body").removeClass( "artdeco-modal-is-open" );
        }, 700)
    }
}

// ******* GITHUB *******
var site = window.location.href.includes('https://github.com/')
if(site) {
    window.addEventListener ("load", githubLoadProfile, false);

    // window.addEventListener ("load", getUserDetails, false);
    // function getUserDetails (evt) {}
    var userName = $(".vcard-fullname").text()
    let address = ""
    let email = ""
    let twitterUrl = ""


    $('.vcard-details li').each(function(i) {
        if($(this).attr("itemprop") == "homeLocation") address = $(this).find("span").text()
        if($(this).attr("itemprop") == "twitter") twitterUrl = $(this).find("a").attr("href")
    });
    if($(".vcard-details .u-email").length) email = $(".vcard-details .u-email").text()
    if(userName) {
        searchUser(userName, email)
        chrome.runtime.sendMessage({
            'type': 'linkedinScrap',
            'fields': {
                'name': userName.trim(),
                'position': "",
                'employer': "",
                'address': address.trim(),
                'email': email.trim(),
                'phone': "",
                'linkedInUrl': "",
                'twitterUrl': twitterUrl,
                'siteUrl': window.location.href
            }
        });
    }
}

// ******* STACKOVERFLOW *******
var site = window.location.href.includes('stackoverflow.com/users')
if(site) {
    // window.addEventListener ("load", getUserDetails, false);
    // function getUserDetails (evt) {}
    window.addEventListener ("load", stackOverflowLoadProfile, false);

    var userName = $(".profile-user--name div").text()
    console.log("username", userName)
    let address = ""
    let email = ""
    if($("ul li svg.iconLocation").length) {
        address = $("ul li svg.iconLocation").closest("div").next().text()
    }
    // var linkedInUrl = $(".iconLink").length ? $(".iconLink").closest("div").next().find("a").attr("href") : ""
    var twitterUrl = $(".iconTwitter").length ? $(".iconTwitter").closest("div").next().find("a").attr("href") : ""
    
    if(userName) {
        searchUser(userName, email)
        chrome.runtime.sendMessage({
            'type': 'linkedinScrap',
            'fields': {
                'name': userName.trim(),
                'position': "",
                'employer': "",
                'address': address.trim(),
                'email': email.trim(),
                'phone': "",
                'linkedInUrl': "",
                'twitterUrl' : twitterUrl,
                'siteUrl': window.location.href
            }
        });
    }
}

// ******* ANGELLIST *******
var site = window.location.href.includes('https://angel.co')
if(site) {
    window.addEventListener ("load", angelListLoadProfile, false);
    var userName = $("h1")
            .clone()
            .children()
            .remove()
            .end()
            .text()
    var address = ""
    let email = ""

    if($(".icon.fontello-location").length) address = $(".icon.fontello-location").next().text()
    
    const position = $(".experience_container").length ? $(".experience_container > div:first-child .show div:nth-child(2) span:first-child").text() : ""
    var employer = $(".experience_container").length ? $(".experience_container > div:first-child .show div:first-child a").text() : ""

    if(!$(".experience_container > div:first-child .show div:first-child a").length) employer = $(".experience_container > div:first-child .show div:first-child").text()
    const linkedInUrl = $(".fontello-linkedin").length ? $(".fontello-linkedin").attr("href") : ''
    const twitterUrl = $(".fontello-twitter").length ? $(".fontello-twitter").attr("href") : ''
    const facebookUrl = $(".fontello-facebook").length ? $(".fontello-facebook").attr("href") : ''

    if(userName) {
        searchUser(userName, email)
        chrome.runtime.sendMessage({
            'type': 'linkedinScrap',
            'fields': {
                'name': userName.trim(),
                'position': position.trim().substr(0, 90),
                'employer': employer.trim().substr(0, 90),
                'address': address.trim(),
                'email': email.trim(),
                'phone': "",
                'linkedInUrl': linkedInUrl,
                'twitterUrl': twitterUrl,
                'facebookUrl': facebookUrl,
                'siteUrl': window.location.href
            }
        });
    }
}

// ******* INDEED *******
var site = window.location.href.includes('https://resumes.indeed.com')
if(site) {
    window.addEventListener ("load", angelListLoadProfile, false);
    var userName = $("#main h1")
            .clone()
            .children()
            .remove()
            .end()
            .text()
    let email = ""

    if($(".icon.fontello-location").length) address = $(".icon.fontello-location").next().text()
    
    const position = $("#main #work-experience-items").length ? $("#main #work-experience-items > div:first-child h3").text() : ""
    var employer = $("#main #work-experience-items").length ? $("#main #work-experience-items > div:first-child .work_company > span:first-child").text() : ""

    const linkedInUrl = $(".fontello-linkedin").length ? $(".fontello-linkedin").attr("href") : ""
    const twitterUrl = $(".fontello-twitter").length ? $(".fontello-twitter").attr("href") : ""
    const facebookUrl = $(".fontello-facebook").length ? $(".fontello-facebook").attr("href") : ""

    const address = $("#main #headline_location").length ? $("#main #headline_location").text() : ""

    if(userName) {
        searchUser(userName, email)
        chrome.runtime.sendMessage({
            'type': 'linkedinScrap',
            'fields': {
                'name': userName.trim(),
                'position': position.trim().substr(0, 90),
                'employer': employer.trim().substr(0, 90),
                'address': address.trim(),
                'email': email.trim(),
                'phone': "",
                'linkedInUrl': linkedInUrl,
                'twitterUrl': twitterUrl,
                'facebookUrl': facebookUrl,
                'siteUrl': window.location.href
            }
        });
    }
}
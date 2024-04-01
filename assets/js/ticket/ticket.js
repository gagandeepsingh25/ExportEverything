var tok;
var client = ZAFClient.init();

let username, zendesk_domain, subdomain;
// Use Promise.all to wait for both API calls to complete
Promise.all([
  client.get('currentUser').then((data) => {
    username = data.currentUser.email;
  }),
  client.get('instances')
    .then((data) => {
      // Log the complete data object for debugging

      // Access the subdomain from the response
      const instanceKeys = Object.keys(data.instances);
      if (instanceKeys.length > 0) {
        const firstInstanceKey = instanceKeys[0];
        subdomain = data.instances[firstInstanceKey].account.subdomain;

        //document.getElementById('subdomains').value = subdomain;
        //document.getElementById('subdomains_div').innerHTML = subdomain;

        checkUserPresence();

        // Log the subdomain
        zendesk_domain = 'https://' + subdomain + '.zendesk.com';

      } else {
        console.error('No instances found in the response.');
      }
    })
    .catch((error) => {
      console.error('Error fetching data from Zendesk:', error);
    })
]).then(() => {
  checkUserPresence();
}).catch((error) => {
  console.error('Error:', error);
});

//*************************************************************************************************************
// Add event listener for blur event on the email field
var eValidate = false;
document.getElementById('emailAddress').addEventListener('blur', function() {
    // Validate the email address
    var userEmail = this.value;
    if (userEmail !== '') {
        if (!validateEmail(userEmail) || userEmail.toLowerCase() !== username) {
            // Display validation message
            var validationMessage = document.getElementById("validationMessage");
            validationMessage.innerHTML = "Email does not belong to agent";
            validationMessage.style.color = "red";
            eValidate = false;
        } else {
            // Clear validation message if email is valid
            var validationMessage = document.getElementById("validationMessage");
            validationMessage.innerHTML = "";
            eValidate = true;
        }
    }
});

// Function to validate email address
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
//*************************************************************************************************************
 // Add event listener for blur event on the subdomain field
var dValidate = false;
document.getElementById('subdomains').addEventListener('blur', function() {
    var userDomain = this.value.trim();
    if (userDomain !== '') {
        if (userDomain.toLowerCase() !== subdomain.toLowerCase()) {
            var validationMessage = document.getElementById("DomainValidationMessage");
            validationMessage.innerHTML = "Subdomain does not belong to agent";
            validationMessage.style.color = "red";
            dValidate = false;
        } else {
            var validationMessage = document.getElementById("DomainValidationMessage");
            validationMessage.innerHTML = "";
            dValidate = true;
        }
    }
});

// Add event listener for click event on the checkbox
document.getElementById('radio_subdomains').addEventListener('click', function() {
    if (this.checked) {
        document.getElementById('subdomains').value = subdomain;
        var validationMessage = document.getElementById("DomainValidationMessage");
        validationMessage.innerHTML = "";
        dValidate = true;
    } else {
        document.getElementById('subdomains').value = "";
        dValidate = false;
    }
});

//*************************************************************************************************************
// Function to fetch the API key from the provided API endpoint
async function fetchApiKey() {
    const apiEndpoint = 'https://bluerockapps.co/index.php/wp-json/custom-api/v1/ustk';
    try {
        // Make a GET request to the API endpoint
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Check if the request was successful (status code 2xx)
        if (response.ok) {
            // Parse the response JSON to get the API key
            const data = await response.json();
            const main = data.ustk;
            // Use the API key or store it securely
            return main;
        } else {
            console.error('Failed to fetch API key:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching API key:', error);
    }
}

// Call the function to fetch the API key
fetchApiKey().then((main) => {
    tok = main;
});
// ******************************************* Activation code********************************************
var activationButton = document.getElementById('activationButton');
var activationTab = document.getElementById('activation');

var free = document.querySelectorAll(".free");
var silver = document.querySelectorAll(".silver");
var talkDiv = document.getElementById("talkDiv");

// Function to hide activation button
function hideActivationButton() {
    activationButton.style.display = 'none';
}

// Function to show activation button
function showActivationButton() {
    activationButton.style.display = 'block';
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    if (!eValidate) {
        return;
    }
    if (!dValidate) {
        return;
    }
    showLoader(); // Prevent the default form submission behavior

    var form = event.target; // Get the form element
    var formData = new FormData(form); // Create FormData object from the form

    // Convert FormData to JSON object
    var jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    // Fetch data using API
    fetch('https://bluerockapps.co/index.php/wp-json/custom-api/v1/save-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response =>{
        if(!response.ok){
            console.error('Email already exists');
            hideLoader();
            document.getElementById('alert_msg').textContent = 'Email already exists';
            return
        }else{
            return response.json();
        }
     })
    .then(data => {
        if(data){
            hideLoader();
            checkUserPresence();
            showSupportNavItems();
            activationTab.style.display = 'none';
        }else{
            hideLoader();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
// Add event listener for form submission
document.getElementById('exportDataFormSubmitform').addEventListener('submit', handleFormSubmit);

var userPlan;
// Function to check if user is present in the database
function checkUserPresence() {
    var userEmail = username;
    if (userEmail) {
        showLoader();
        var url = "https://bluerockapps.co/index.php/wp-json/custom-api/v1/list-user/" + userEmail
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('User is not present in the database');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.email == userEmail){
                hideActivationButton();
                showSupportNavItems();
               userPlan = data.data.plan;
//               if (userPlan == 'price_1OrFX8JmsaQyNnzsnVEyVklH'){ // testing
               if (userPlan == 'price_1OrGDzJmsaQyNnzsd5Y8sJmx'){ // silver plan

                    var silverPlan = document.getElementById('professionalPlan');
                    silverPlan.querySelector('.text-light').style.display = 'block';
                    silverPlan.style.border = '2px solid #2995a8';
                    silverPlan.querySelector('.btn').style.display = 'none';

                    talkDiv.setAttribute("onclick", "return false");
                    talkDiv.classList.add("disabled-div");
                    talkDiv.classList.add("disabled");

                    silver.forEach(function(element) {
                        element.classList.add("disabled");
                    });

//               }else if (userPlan == 'price_1OrFX8JmsaQyNnzsPLM7pjI8'){ // testing
               }else if (userPlan == 'price_1OrGDyJmsaQyNnzsd5rJXUM9'){ // gold plan

                    var goldPlan = document.getElementById('enterprisePlan');
                    goldPlan.querySelector('.text-light').style.display = 'block';
                    goldPlan.style.border = '2px solid #2995a8';
                    goldPlan.querySelector('.btn').style.display = 'none';

                    talkDiv.setAttribute("onclick", "showTalkNavItems()");
                    talkDiv.classList.remove("disabled-div");
               }else{
                    var freePlan = document.getElementById('freePlan');
                    freePlan.querySelector('.text-light').style.display = 'block';
                    freePlan.style.border = '2px solid #2995a8';
                    freePlan.querySelector('.btn').style.display = 'none';

                    free.forEach(function(element) {
                        element.classList.add("disabled");
                    });

                    talkDiv.setAttribute("onclick", "return false");
                    talkDiv.classList.add("disabled-div");

                     // Disable JSON and XML options
                    document.getElementById('jsonOption').disabled = true;
                    document.getElementById('xmlOption').disabled = true;
               }
            }else {
                showActivationButton();
            }
            hideLoader();
        })
        .catch(error => {
            console.error('Error:', error.message);
            showActivationButton();
            hideLoader();
        });
    }else{
        hideLoader();
    }
}
// ******************************************* view based tickets START********************************************
var ticket_api_data = [];

var requesterValuesArray = [];
var submitterValuesArray = [];
var assigneeValuesArray = [];
var fieldValuesArray = [];
var orgValuesArray = [];
var groupValuesArray = [];
var formValuesArray = [];
var brandsValuesArray = [];
var customValuesArray = [];
var MetricValuesArray = [];

var dict = {};

function addFieldToTable() {
    var addFieldSelect = document.getElementById('addFieldSelect');

    // ##############################
    // Check if the user's plan is neither silver nor gold
//    if (userPlan != 'price_1OrFX8JmsaQyNnzsnVEyVklH' && userPlan != 'price_1OrFX8JmsaQyNnzsPLM7pjI8') { //testing
    if (userPlan != 'price_1OrGDzJmsaQyNnzsd5Y8sJmx' && userPlan != 'price_1OrGDyJmsaQyNnzsd5rJXUM9') {
        // Check if more than 12 fields have been selected
        if (countSelectedFields() >= 12) {
            return;
        }
    }
    // ##############################
    // Get the selected option
    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];
    var field = selectedOption.text;
    var type = 'text';
    var field_val = selectedOption.value;

    // Check if the text 'organization' is present in the field variable
    if (field.toLowerCase().includes('requester')) {
        requesterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('submitter')) {
        submitterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('assignee')) {
        assigneeValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('organization')) {
        orgValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('group')) {
        groupValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('form')) {
        formValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('brand')) {
        brandsValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('ticket')) {
        fieldValuesArray.push(field_val);
    }else if (field.toLowerCase().includes('metric')) {
        MetricValuesArray.push(field_val);
    } else {
        // Append field_val to the array
        customValuesArray.push(field_val);
    }

    if (field === 'Ticket ID' || field === 'Requester ID'|| field === 'Submitter ID'|| field === 'Assignee ID'|| field === 'Organization ID' || field === 'Group ID' || field === 'Form ID' || field === 'Brand ID'){
        type = 'number';
    }

    // Add a new row to the table if a field is selected ,ok
    if (field) {
        var table = document.getElementById('fieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var fieldCell = newRow.insertCell(0);
        var groupCell = newRow.insertCell(1);
        var typeCell = newRow.insertCell(2);
        var deleteCell = newRow.insertCell(3);

        fieldCell.textContent = field;
        groupCell.textContent = 'Ticket';
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn  btn-sm" style="color: #007bff;" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>'; // Button to delete row
        // Reset the select dropdown i ll here
        addFieldSelect.selectedIndex = 0;
    }

    dict = {
        "fieldValuesArray": fieldValuesArray,
        "orgValuesArray": orgValuesArray,
        "groupValuesArray": groupValuesArray,
        "formValuesArray": formValuesArray,
        "brandsValuesArray": brandsValuesArray,
        "requesterValuesArray": requesterValuesArray,
        "submitterValuesArray": submitterValuesArray,
        "assigneeValuesArray": assigneeValuesArray,
        "customValuesArray": customValuesArray ,
        "metricValuesArray": MetricValuesArray
    };
}

// Function to count the number of selected fields
function countSelectedFields() {
    var selectedFields = document.getElementById('fieldMappingTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    return selectedFields.length;
}


var selected_template;
async function checkSelections() {
    // Get the dropdowns and selected options
    var viewSelect = document.getElementById('viewSelect');
    var templateSelect = document.getElementById('templateSelect');

    var selectedOption_ticket = viewSelect.options[viewSelect.selectedIndex];
    var selectedOption_template = templateSelect.options[templateSelect.selectedIndex];

    var selectedValue_ticket = selectedOption_ticket.value;
    var selectedValue_temp = selectedOption_template.value;
    selected_template = selectedValue_temp;

    // Check if options are selected in both dropdowns
    if (selectedValue_ticket && selectedValue_temp) {
        document.getElementById('tablePlaceholder').classList.remove('d-none');

        // Ticket data
        ticket_api_data = await ticketInfo(selectedValue_ticket);
        if (ticket_api_data && ticket_api_data.length) {
            var viewSelectMessage = $('#viewSelectMessage');
            var lengthMessage = 'This view contains  ' + ticket_api_data.length + ' tickets.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            var viewSelectMessage = $('#viewSelectMessage');
            var lengthMessage = 'This view contains 0 tickets.';
            viewSelectMessage.text(lengthMessage).show();
        }

    } else {
        document.getElementById('tablePlaceholder').classList.add('d-none');
    }
    return ticket_api_data;
}


function deleteRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[0].textContent.trim();

    // Show the corresponding option in the select element
    var addFieldSelect = document.getElementById('addFieldSelect');
    // Find the selected option based on text content
    var selectedOption;
    for (var i = 0; i < addFieldSelect.options.length; i++) {
        if (addFieldSelect.options[i].text === fieldValue) {
            selectedOption = addFieldSelect.options[i];
            break;
        }
    }

    if (!selectedOption) {
        console.error('Selected option not found');
        return;
    }

    if (requesterValuesArray.includes(selectedOption.value)) {
        var indexComment = requesterValuesArray.indexOf(selectedOption.value);
        requesterValuesArray.splice(indexComment, 1);
    }
    if (submitterValuesArray.includes(selectedOption.value)) {
        var indexComment = submitterValuesArray.indexOf(selectedOption.value);
        submitterValuesArray.splice(indexComment, 1);
    }
    if (assigneeValuesArray.includes(selectedOption.value)) {
        var indexComment = assigneeValuesArray.indexOf(selectedOption.value);
        assigneeValuesArray.splice(indexComment, 1);
    }
    if (fieldValuesArray.includes(selectedOption.value)) {
        var indexComment = fieldValuesArray.indexOf(selectedOption.value);
        fieldValuesArray.splice(indexComment, 1);
    }
    if (orgValuesArray.includes(selectedOption.value)) {
        var indexComment = orgValuesArray.indexOf(selectedOption.value);
        orgValuesArray.splice(indexComment, 1);
    }
    if (groupValuesArray.includes(selectedOption.value)) {
        var indexComment = groupValuesArray.indexOf(selectedOption.value);
        groupValuesArray.splice(indexComment, 1);
    }
    if (formValuesArray.includes(selectedOption.value)) {
        var indexComment = formValuesArray.indexOf(selectedOption.value);
        formValuesArray.splice(indexComment, 1);
    }
    if (brandsValuesArray.includes(selectedOption.value)) {
        var indexComment = brandsValuesArray.indexOf(selectedOption.value);
        brandsValuesArray.splice(indexComment, 1);
    }
    if (customValuesArray.includes(selectedOption.value)) {
        var indexComment = customValuesArray.indexOf(selectedOption.value);
        customValuesArray.splice(indexComment, 1);
    }
    if (MetricValuesArray.includes(selectedOption.value)) {
        var indexComment = MetricValuesArray.indexOf(selectedOption.value);
        MetricValuesArray.splice(indexComment, 1);
    }

    dict = {
        "fieldValuesArray": fieldValuesArray,
        "orgValuesArray": orgValuesArray,
        "groupValuesArray": groupValuesArray,
        "formValuesArray": formValuesArray,
        "brandsValuesArray": brandsValuesArray,
        "requesterValuesArray": requesterValuesArray,
        "submitterValuesArray": submitterValuesArray,
        "assigneeValuesArray": assigneeValuesArray,
        "customValuesArray": customValuesArray ,
        "metricValuesArray": MetricValuesArray
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// FETCH TICKET DATA FROM API
async function ticketInfo(selectedValue_ticket) {
    try {
        var Updated_tickets_Array = [];
        var url = `${zendesk_domain}/api/v2/tickets.json?${selectedValue_ticket}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);

        ticketsArray = data['tickets'];
        for (var i = 0; i < ticketsArray.length; i++) {
            var ticket = ticketsArray[i];
            var par_dict =
                {'requester_id': ticket['requester_id'],
                 'submitter_id': ticket['submitter_id'],
                 'assignee_id': ticket['assignee_id'],
                 'organization_id': ticket['organization_id'],
                 'group_id': ticket['group_id'],
                 'ticket_form_id': ticket['ticket_form_id'],
                 'brand_id': ticket['brand_id'],
                 'custom_status_id': ticket['custom_status_id'],
                 'id': ticket["id"]
                 };

            var ApiData = await fetchRequesterData(par_dict);
            ticket = {
                ...ticket,
                ...ApiData
            };
            Updated_tickets_Array.push(ticket);
        }
    } catch (error) {
        console.error('Error fetching ticket info:---', error);
    }
    return Updated_tickets_Array;
}

function fetchRequesterData(par_dict) {
    return new Promise(async (resolve, reject) => {
        try {
            var requester_id = par_dict.requester_id;
            var submitter_id = par_dict.submitter_id;
            var assignee_id = par_dict.assignee_id;
            var organization_id = par_dict.organization_id;
            var group_id = par_dict.group_id;
            var ticket_form_id = par_dict.ticket_form_id;
            var brand_id = par_dict.brand_id;
            var custom_status_id = par_dict.custom_status_id;
            var t_id = par_dict.id;
            showLoader();
            const headers = {
                Authorization: `Basic ${btoa(`${username}/token:${tok}`)}`,
                'Content-Type': 'application/json'
            };

            let user_data = {};

            // Helper function to make an asynchronous request
            const makeRequest = async (url) => {
                try {
                    const response = await client.request(url, {
                        type: "GET",
                        headers: headers,
                    });
                    return response;
                } catch (error) {
                    console.error(error);
                    return {};
                }
            };

            // Array to store all promises for asynchronous requests
            const promises = [];

            if (requester_id && requester_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/users/${requester_id}`));
            }
            if (submitter_id && submitter_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/users/${submitter_id}`));
            }
            if (assignee_id && assignee_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/users/${assignee_id}`));
            }
            if (organization_id && organization_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/organizations/${organization_id}`));
            }
            if (group_id && group_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/groups/${group_id}`));
            }
            if (ticket_form_id && ticket_form_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/ticket_forms/${ticket_form_id}`));
            }
            if (brand_id && brand_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/brands/${brand_id}`));
            }
            if (custom_status_id && custom_status_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/custom_statuses/${custom_status_id}`));
            }
            if (t_id && t_id !== 'null') {
                promises.push(makeRequest(`${zendesk_domain}/api/v2/tickets/${t_id}/metrics`));
            }

            // Wait for all promises to resolve
            const responses = await Promise.all(promises);

            // Populate user_data with responses
            if (requester_id && requester_id !== 'null') {
                user_data['requester'] = responses.shift();
            }else{
                user_data['requester'] = {};
            }
            if (submitter_id && submitter_id !== 'null') {
                user_data['submitter'] = responses.shift();
            }else{
                user_data['submitter'] = {};
            }
            if (assignee_id && assignee_id !== 'null') {
                user_data['assignee'] = responses.shift();
            }else{
                user_data['assignee'] = {};
            }
            if (organization_id && organization_id !== 'null') {
                user_data['organization'] = responses.shift();
            }else{
                user_data['organization'] = {};
            }
            if (group_id && group_id !== 'null') {
                user_data['groups'] = responses.shift();
            }else{
                user_data['groups'] = {};
            }
            if (ticket_form_id && ticket_form_id !== 'null') {
                user_data['ticket_forms'] = responses.shift();
            }else{
                user_data['ticket_forms'] = {};
            }
            if (brand_id && brand_id !== 'null') {
                user_data['brands'] = responses.shift();
            }else{
                user_data['brands'] = {};
            }
            if (custom_status_id && custom_status_id !== 'null') {
                user_data['custom_statuses'] = responses.shift();
            }else{
                user_data['custom_statuses'] = {};
            }
            if (t_id && t_id !== 'null') {
                user_data['metric_set'] = responses.shift();
            }else{
                user_data['metric_set'] = {};
            }
            resolve(user_data);
        } catch (error) {
            reject(error);
        }
        hideLoader();
    });
}


// Function to create a CSV file from selected fields
async function createContent(ticket_api_data, dict) {
    try {
        var selectedFieldsArray = [];

        for (var i = 0; i < ticket_api_data.length; i++) {
            var ticket = ticket_api_data[i];

            var count = await commentCount(ticket['id']);
            ticket['count'] = count

            // ***************************************************
            var selectedFieldsObject = {};
            // Export Ticket
            var select_fields_data = dict['fieldValuesArray'];

            for (var j = 0; j < select_fields_data.length; j++) {
                try{
                    var field = select_fields_data[j];
                    if (field !== null) {
                        if (ticket[field] !== null && ticket[field] !== undefined) {
                            selectedFieldsObject["Ticket_" + field] = '"' + ticket[field].toString() + '"';
                        } else {
                            selectedFieldsObject[field] = '';  // or handle the case where ticket[field] is null or undefined
                        }
                    } else {
                        selectedFieldsObject[field] = '';  // or handle the case where field is null
                    }

                }catch (error) {
                    console.error('Error in Ticket fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Requester
            var select_req_fields_data = dict['requesterValuesArray'];

            // Iterate through selected group fields and add them to the new object
            for (var j = 0; j < select_req_fields_data.length; j++) {
                try{
                    var reqField = select_req_fields_data[j];
                    if (reqField !== null){
                        if (ticket[reqField] !== null && ticket[reqField] !== undefined) {
                            selectedFieldsObject["Requester_" + reqField] = '"' + ticket['requester']['user'][reqField].toString() + '"';
                        } else {
                            selectedFieldsObject["Requester_" + reqField] = '';
                        }
                    }else{
                        selectedFieldsObject["Requester_" + reqField] = '';
                    }
                }catch (error) {
                    console.error('Error in Requester fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Submitter
            var select_sub_fields_data = dict['submitterValuesArray'];

            // Iterate through selected group fields and add them to the new object
            for (var j = 0; j < select_sub_fields_data.length; j++) {
                try{
                    var subField = select_sub_fields_data[j];
                    if (subField !== null){
                        if (ticket[subField] !== null && ticket[subField] !== undefined) {
                            selectedFieldsObject["Submitter_" + subField] = '"' + ticket['submitter']['user'][subField].toString() + '"';
                        } else {
                            selectedFieldsObject["Submitter_" + subField] = '';
                        }
                    }else{
                        selectedFieldsObject["Submitter_" + subField] = '';
                    }
                }catch (error) {
                    console.error('Error in Submitter fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Assignee
            var select_assignee_fields_data = dict['assigneeValuesArray'];

            // Iterate through selected group fields and add them to the new object
            for (var j = 0; j < select_assignee_fields_data.length; j++) {
                try{
                    var assField = select_assignee_fields_data[j];
                    if (assField !== null){
                        if (ticket[assField] !== null && ticket[assField] !== undefined) {
                            selectedFieldsObject["Assignee_" + assField] = '"' + ticket['assignee']['user'][assField].toString() + '"';
                        } else {
                            selectedFieldsObject["Assignee_" + assField] = '';
                        }
                    }else{
                        selectedFieldsObject["Assignee_" + assField] = '';
                    }
                }catch (error) {
                    console.error('Error in Assignee fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Group
            var select_group_fields_data = dict['groupValuesArray'];

            // Iterate through selected group fields and add them to the new object
            for (var j = 0; j < select_group_fields_data.length; j++) {
                try{
                    var groupField = select_group_fields_data[j];
                    if (groupField !== null){
                        if (ticket[groupField] !== null && ticket[groupField] !== undefined) {
                            selectedFieldsObject["Group_" + groupField] = '"' + ticket['groups']['group'][groupField].toString() + '"';
                        } else {
                            selectedFieldsObject["Group_" + groupField] = '';
                        }
                    }else{
                        selectedFieldsObject["Group_" + groupField] = '';
                    }
                }catch (error) {
                    console.error('Error in Group fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Form
            var formValuesArray = dict['formValuesArray'];

            // Iterate through selected form fields and add them to the new object
            for (var j = 0; j < formValuesArray.length; j++) {
                try{
                    var formField = formValuesArray[j];
                    if (formField !== null){
                        if (ticket[formField] !== null && ticket[formField] !== undefined) {
                            selectedFieldsObject["Form_" + formField] = '"' + ticket['ticket_forms']['ticket_form'][formField].toString() + '"';
                        } else {
                            selectedFieldsObject["Form_" + formField] = '';
                        }
                    }else{
                        selectedFieldsObject["Form_" + formField] = '';
                    }
                }catch (error) {
                    console.error('Error in Form fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Brand
            var brandsValuesArray = dict['brandsValuesArray'];

            // Iterate through selected form fields and add them to the new object
            for (var j = 0; j < brandsValuesArray.length; j++) {
                try{
                    var brandField = brandsValuesArray[j];
                    if (brandField !== null){
                        if (ticket[brandField] !== null && ticket[brandField] !== undefined) {
                            selectedFieldsObject["Brand_" + brandField] = '"' + ticket['brands']['brand'][brandField].toString() + '"';
                        } else {
                            selectedFieldsObject["Brand_" + brandField] = '';
                        }
                    }else{
                        selectedFieldsObject["Brand_" + brandField] = '';
                    }
                }catch (error) {
                    console.error('Error in Brand fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Organization
            var orgValuesArray = dict['orgValuesArray'];
            for (var j = 0; j < orgValuesArray.length; j++) {
                try {
                    var orgField = orgValuesArray[j];
                    if (orgField !== null) {
                        if (
                            ticket['organizations'] &&
                            ticket['organizations']['organization'] &&
                            ticket['organizations']['organization'][orgField] !== undefined &&
                            ticket['organizations']['organization'][orgField] !== null
                        ) {
                            selectedFieldsObject["Organization_" + orgField] =
                                '"' + ticket['organizations']['organization'][orgField].toString() + '"';
                        } else {
                            selectedFieldsObject["Organization_" + orgField] = '';
                        }
                    } else {
                        selectedFieldsObject["Organization_" + orgField] = '';
                    }
                } catch (error) {
                    console.error('Error in Organization fields:', error);
                    continue;
                }
            }

            // ***************************************************
            // Export Custom
            var customValuesArray = dict['customValuesArray'];

            // Iterate through selected form fields and add them to the new object
            for (var j = 0; j < customValuesArray.length; j++) {
                try{
                    var custField = customValuesArray[j];
                    if (custField !== null){
                        if (ticket[custField] !== null && ticket[custField] !== undefined) {
                            if('subject' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['subject'];
                            }
                            else if('description' == custField){
                                selectedFieldsObject["Custom_" + custField] = '"' + ticket['description'].toString() + '"';
                            }
                            else if('status' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['status'];
                            }
                            else if('type' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['type'];
                            }
                            else if('priority' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['priority'];
                            }
                            else if('group_name' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['groups']['group']['name'];
                            }
                            else if('assignee_name' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['assignee']['user']['name'];
                            }
                            else if('ticket_status' == custField){
                                selectedFieldsObject["Custom_" + custField] = ticket['status'];
                            }
                            else if('topic' == custField){
                                selectedFieldsObject["Custom_Topic"] = ticket['subject'];
                            }
                        }else{
                            selectedFieldsObject[custField] = '';
                        }
                    }else{
                        selectedFieldsObject[custField] = '';
                    }
                }catch (error) {
                    console.error('Error in custom fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Export Metric
            var metricValuesArray = dict['metricValuesArray'];

            for (var j = 0; j < metricValuesArray.length; j++) {
                try{
                    var metricField = metricValuesArray[j];
                    if (metricField !== null){
                        if (ticket[metricField] !== null && ticket[metricField] !== undefined){
                            if('reply_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject[metricField] = ticket['metric_set']['ticket_metric']['reply_time_in_minutes']['calendar'];
                            }else if('reply_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['reply_time_in_minutes']['business'];
                            }else if('first_resolution_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['first_resolution_time_in_minutes']['calendar'];
                            }else if('first_resolution_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['first_resolution_time_in_minutes']['business'];
                            }else if('full_resolution_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['full_resolution_time_in_minutes']['calendar'];
                            }else if('full_resolution_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['full_resolution_time_in_minutes']['business'];
                            }else if('agent_wait_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['agent_wait_time_in_minutes']['calendar'];
                            }else if('agent_wait_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['agent_wait_time_in_minutes']['business'];
                            }else if('requester_wait_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['requester_wait_time_in_minutes']['calendar'];
                            }else if('requester_wait_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['requester_wait_time_in_minutes']['business'];
                            }else if('on_hold_time_in_minutes_calendar' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['on_hold_time_in_minutes']['calendar'];
                            }else if('on_hold_time_in_minutes_business' == metricField){
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric']['on_hold_time_in_minutes']['business'];
                            }else{
                                selectedFieldsObject["Metric_" + metricField] = ticket['metric_set']['ticket_metric'][metricField];
                            }
                        }else{
                            selectedFieldsObject["Metric_" + metricField] = '';
                        }
                    }else{
                        selectedFieldsObject["Metric_" + metricField] = '';
                    }
               }catch (error) {
                    console.error('Error in metric fields:', error);
                    continue
               }
            }
            // ***************************************************

            selectedFieldsArray.push(selectedFieldsObject);
        }

        if (selected_template == 'JSON'){
            // Convert the arrays to JSON format
            var jsonContent = JSON.stringify(selectedFieldsArray, null, 2);
            if(jsonContent) {
                downloadJSON(jsonContent, 'ticket-export.json');
            } else {
                console.error('Error generating JSON data.');
            }
        }else if (selected_template == 'XML') {
            // Convert the arrays to XML format
            var xml = convertArrayOfObjectsToXML(selectedFieldsArray);
            if(xml) {
                downloadXML(xml, 'ticket-export.xml');
            } else {
                console.error('Error generating XML data.');
            }
        }else{
            var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
            if (csv) {
                downloadCSV(csv, 'ticket-export.csv');
            } else {
                console.error('Error generating CSV data.');
            }
        }
    } catch (error) {
        console.error('Error in create Content function:', error);
    }
}

// Function to trigger the download of the JSON file
function downloadJSON(jsonContent, filename) {
    var jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    var jsonURL = URL.createObjectURL(jsonBlob);
    var link = document.createElement('a');
    link.href = jsonURL;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    hideLoader();
}

// Function to trigger the download of the CSV file
function downloadCSV(csv, filename) {
    var csvBlob = new Blob([csv], { type: 'text/csv' });
    var csvURL = URL.createObjectURL(csvBlob);
    var link = document.createElement('a');
    link.href = csvURL;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    hideLoader();
}

// Function to convert an array of objects to CSV format
function convertArrayOfObjectsToCSV(ticketArray) {
    try {
        // Check if ticketArray is defined and not empty
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var ticketKeys = Object.keys(ticketArray[0]);

        var header = ticketKeys.join(',') + '\n';

        var csv = ticketArray.map(function (item, index) {
            var row = Object.values(item).join(',');
            return row + '\n';
        });

        return header + csv.join('');
    } catch (error) {
        console.error('Error converting array to CSV:', error);
        return '';
    }
}

async function commentCount(id) {
    try {
        var val = 0;
        var url = `${zendesk_domain}/api/v2/tickets/${id}/comments/count`;  // Added a slash before 'comments'
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);

        val = data['count']['value'];
        return val;
    } catch (error) {
        console.error('Error in comment Count:', error);
        return 0;
    }
}

// Add an event listener to the "Export" button
document.getElementById('exportButton').addEventListener('click', async function () {
    try {
        showLoader();
        addFieldToTable();
        await createContent(ticket_api_data, dict);
    } catch (error) {
        console.error('Error fetching onclick export button:', error);
    }
});

// ******************************************* view based tickets END********************************************


// ******************************************* search based tickets START****************************************


async function checkSelections_search() {
    const viewSelect = document.getElementById('ticketQuery');
    const templateSelect = document.getElementById('templateSelect_search');
    const tablePlaceholder = document.getElementById('ticketTablePlaceholder');

    const selectedOption_template = templateSelect.options[templateSelect.selectedIndex];
    const selectedValue_temp = selectedOption_template.value;

    selected_template = selectedValue_temp;

    // Check if both view and template are selected
    if (viewSelect.value && templateSelect.value) {
        // Show the table placeholder
        tablePlaceholder.classList.remove('d-none');
         try {
            const query = viewSelect.value;
            ticket_api_data = await searchTicketsData(query);
        } catch (error) {
            console.error('Error fetching search tickets data:', error);
        }
    } else {
        // Hide the table placeholder if either view or template is not selected
        tablePlaceholder.classList.add('d-none');
    }
    return ticket_api_data;
}

async function searchTicketsData(query) {
    query = query.toString();
    showLoader();

    if (!query) {
        console.error('Invalid search query. Please provide a valid query.');
        hideLoader();
        return Promise.reject('Invalid search query.');
    }

    const auth = `Basic ${btoa(`${username}/token:${tok}`)}`;
    const headers = {
        Authorization: auth,
        'Content-Type': 'application/json',
    };

    var user_data = {};
    const url = `${zendesk_domain}/api/v2/search.json?query=type:ticket ${query}&sort_by=created_at&sort_order=asc`;
    var Updated_Array = [];
    try {
        const response = await client.request(url, {
            method: 'GET',
            headers: headers,
        });

        hideLoader();
        const t_d = response['results'];
        if (response && response.results.length) {
            const searchSelectMessage = $('#searchSelectMessage');
            const lengthMessage = 'This view contains ' + response.results.length + ' tickets.';
            searchSelectMessage.text(lengthMessage).show();
        } else {
            const searchSelectMessage = $('#searchSelectMessage');
            const lengthMessage = 'This view contains 0 tickets.';
            searchSelectMessage.text(lengthMessage).show();
        }
        for (let i = 0; i < t_d.length; i++) {
             try {
                var ticket = t_d[i];
                var par_dict = {
                    'requester_id': t_d[i].requester_id,
                    'submitter_id': t_d[i].submitter_id,
                    'assignee_id': t_d[i].assignee_id,
                    'organization_id': t_d[i].organization_id,
                    'group_id': t_d[i].group_id,
                    'ticket_form_id': t_d[i].ticket_form_id,
                    'brand_id': t_d[i].brand_id,
                    'custom_status_id': t_d[i].custom_status_id,
                    'id': t_d[i].id,
                };
                var AData = await fetchRequesterData(par_dict);
                ticket = {
                    ...ticket,
                    ...AData
                };
                Updated_Array.push(ticket);

             }catch (error) {
                console.error('Error processing ticket data:', error);
            }
        }
        return Updated_Array;
    } catch (error) {
        hideLoader();
        console.error('Error fetching search users data:', error);
        return Promise.reject(error); // Reject with the error
    }
}

function addFieldToTable_search() {
    var addFieldSelect = document.getElementById('addFieldSelect_search');

    // ##############################
    // Get the selected option
    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];
    var field = selectedOption.text;
    var type = 'text';
    var field_val = selectedOption.value;

    // Check if the text 'organization' is present in the field variable
    if (field.toLowerCase().includes('requester')) {
        requesterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('submitter')) {
        submitterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('assignee')) {
        assigneeValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('organization')) {
        orgValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('group')) {
        groupValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('form')) {
        formValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('brand')) {
        brandsValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('ticket')) {
        fieldValuesArray.push(field_val);
    }else if (field.toLowerCase().includes('metric')) {
        MetricValuesArray.push(field_val);
    } else {
        // Append field_val to the array
        customValuesArray.push(field_val);
    }

    if (field === 'Ticket ID' || field === 'Requester ID'|| field === 'Submitter ID'|| field === 'Assignee ID'|| field === 'Organization ID' || field === 'Group ID' || field === 'Form ID' || field === 'Brand ID'){
        type = 'number';
    }

    // Add a new row to the table if a field is selected ,ok
    if (field) {
        var table = document.getElementById('searchfieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var fieldCell = newRow.insertCell(0);
        var groupCell = newRow.insertCell(1);
        var typeCell = newRow.insertCell(2);
        var deleteCell = newRow.insertCell(3);

        fieldCell.textContent = field;
        groupCell.textContent = 'Ticket';
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn  btn-sm" style="color: #007bff;" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>'; // Button to delete row
        // Reset the select dropdown i ll here
        addFieldSelect.selectedIndex = 0;
    }

    dict = {
        "fieldValuesArray": fieldValuesArray,
        "orgValuesArray": orgValuesArray,
        "groupValuesArray": groupValuesArray,
        "formValuesArray": formValuesArray,
        "brandsValuesArray": brandsValuesArray,
        "requesterValuesArray": requesterValuesArray,
        "submitterValuesArray": submitterValuesArray,
        "assigneeValuesArray": assigneeValuesArray,
        "customValuesArray": customValuesArray ,
        "metricValuesArray": MetricValuesArray
    };
}


// Add an event listener to the "Export" button
document.getElementById('exportButton_search').addEventListener('click', async function () {
    try {
        showLoader();
        addFieldToTable_search();
        await createContent(ticket_api_data, dict);
    } catch (error) {
        console.error('Error fetching onclick export button:', error);
    }
});


// ******************************************* search based tickets END********************************************

// ******************************************* time based tickets START********************************************
function ticketformatDateToUnixTimestamp(dateString) {
    var parts = dateString.split('-');
    var formattedDate = new Date(parts[2], parts[0] - 1, parts[1]);
    return Math.floor(formattedDate.getTime() / (1000 * 60 * 60 * 24));
}

async function checkSelections_time() {
    var ticketViewSelect = document.getElementById('templateSelect_time');

    var selectedOption_template = ticketViewSelect.options[ticketViewSelect.selectedIndex];
    var selectedValue_temp = selectedOption_template.value;

    selected_template = selectedValue_temp;

    if (ticketViewSelect.value) {
        showLoader();
        document.getElementById('searchticketTablePlaceholder').classList.remove('d-none');

        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        ticket_api_data = await SearchTicketInfo(t_start, t_end)
        if (ticket_api_data && ticket_api_data.length) {
            hideLoader();
            var viewSelectMessage = $('#timeSelectMessage');
            var lengthMessage = 'This view contains  ' + ticket_api_data.length + ' tickets.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#timeSelectMessage');
            var lengthMessage = 'This view contains 0 tickets.';
            viewSelectMessage.text(lengthMessage).show();
        }
    } else {
        document.getElementById('searchticketTablePlaceholder').classList.add('d-none');
        hideLoader();
    }
    return attachments_data;
}


// FETCH COMMENT DATA FROM API
async function SearchTicketInfo(t_start, t_end) {
    try {
        var Updated_Array = [];
        var url = `${zendesk_domain}/api/v2/incremental/tickets.json?start_time=${t_start}&end_time=${t_end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        ticketsArray = data['tickets'];
        for (var i = 0; i < ticketsArray.length; i++) {
            var ticket = ticketsArray[i];
            var par_dict =
                {'requester_id': ticket['requester_id'],
                 'submitter_id': ticket['submitter_id'],
                 'assignee_id': ticket['assignee_id'],
                 'organization_id': ticket['organization_id'],
                 'group_id': ticket['group_id'],
                 'ticket_form_id': ticket['ticket_form_id'],
                 'brand_id': ticket['brand_id'],
                 'custom_status_id': ticket['custom_status_id'],
                 'id': ticket["id"]
                 };

            var ApiData = await fetchRequesterData(par_dict);
            ticket = {
                ...ticket,
                ...ApiData
            };
            Updated_Array.push(ticket);
        }
    } catch (error) {
        console.error('Error fetching comments ticket info:---', error);
    }
    return Updated_Array;
}


// Function to add attachment field to table
function addFieldToTable_time() {
    var addFieldSelect = document.getElementById('ticketFieldSelect');

    // ##############################
    // Get the selected option
    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = addFieldSelect.options[addFieldSelect.selectedIndex];
    var field = selectedOption.text;
    var type = 'text';
    var field_val = selectedOption.value;

    // Check if the text 'organization' is present in the field variable
    if (field.toLowerCase().includes('requester')) {
        requesterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('submitter')) {
        submitterValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('assignee')) {
        assigneeValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('organization')) {
        orgValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('group')) {
        groupValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('form')) {
        formValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('brand')) {
        brandsValuesArray.push(field_val);
    } else if (field.toLowerCase().includes('ticket')) {
        fieldValuesArray.push(field_val);
    }else if (field.toLowerCase().includes('metric')) {
        MetricValuesArray.push(field_val);
    } else {
        // Append field_val to the array
        customValuesArray.push(field_val);
    }

    if (field === 'Ticket ID' || field === 'Requester ID'|| field === 'Submitter ID'|| field === 'Assignee ID'|| field === 'Organization ID' || field === 'Group ID' || field === 'Form ID' || field === 'Brand ID'){
        type = 'number';
    }

    // Add a new row to the table if a field is selected ,ok
    if (field) {
        var table = document.getElementById('timefieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var fieldCell = newRow.insertCell(0);
        var groupCell = newRow.insertCell(1);
        var typeCell = newRow.insertCell(2);
        var deleteCell = newRow.insertCell(3);

        fieldCell.textContent = field;
        groupCell.textContent = 'Ticket';
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn  btn-sm" style="color: #007bff;" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>'; // Button to delete row
        // Reset the select dropdown i ll here
        addFieldSelect.selectedIndex = 0;
    }

    dict = {
        "fieldValuesArray": fieldValuesArray,
        "orgValuesArray": orgValuesArray,
        "groupValuesArray": groupValuesArray,
        "formValuesArray": formValuesArray,
        "brandsValuesArray": brandsValuesArray,
        "requesterValuesArray": requesterValuesArray,
        "submitterValuesArray": submitterValuesArray,
        "assigneeValuesArray": assigneeValuesArray,
        "customValuesArray": customValuesArray ,
        "metricValuesArray": MetricValuesArray
    };
}


// Add an event listener to the "Export" button
document.getElementById('exportButton_time').addEventListener('click', async function () {
    try {
        showLoader();
        addFieldToTable_time();
        await createContent(ticket_api_data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based export button:', error);
    }
});


// ******************************************* time based tickets END**********************************************

// Function to trigger the download of the XML file
function downloadXML(xml, filename) {
    var xmlBlob = new Blob([xml], { type: 'text/xml' });
    var xmlURL = URL.createObjectURL(xmlBlob);
    var link = document.createElement('a');
    link.href = xmlURL;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    hideLoader();
}

// Function to convert an array of objects to XML format
function convertArrayOfObjectsToXML(ticketArray) {
    try {
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tickets>\n';

        for (var i = 0; i < ticketArray.length; i++) {
            var ticketObject = ticketArray[i];
            xml += '<ticket>\n';

            for (var key in ticketObject) {
                if (ticketObject.hasOwnProperty(key)) {
                    if (key != ''){
                        // Ensure valid XML element name by replacing invalid characters
                        var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                        xml += `<${sanitizedKey}>${escapeXml(ticketObject[key])}</${sanitizedKey}>\n`;
                    }
                }
            }

            xml += '</ticket>\n';
        }

        xml += '</tickets>';
        return xml;
    } catch (error) {
        console.error('Error converting array to XML:', error);
        return '';
    }
}

// Function to escape special characters in XML content
function escapeXml(unsafe) {
    if (typeof unsafe === 'string' || unsafe instanceof String) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    } else {
        return unsafe;
    }
}


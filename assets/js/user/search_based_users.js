// ----------------------------- User ------------------------------------>

// ******************** START USER CODE *********************

var Search_Users_Data = [];
async function checkUserSelections() {
    var userViewSelect = document.getElementById('usersquery');
    var userTemplateSelect = document.getElementById('userTemplateSelect');

    var selectedOption_template = userTemplateSelect.options[userTemplateSelect.selectedIndex];

    var selectedValue_temp = selectedOption_template.value;
    selected_template = selectedValue_temp;

    if (userViewSelect.value && userTemplateSelect.value) {
        document.getElementById('userTablePlaceholder').classList.remove('d-none');

         // Call searchUsersData function and handle the data
        try {
            const query = userViewSelect.value;
            const result = await searchUsersData(zendesk_domain, username, token, query);

            Search_Users_Data = result.user_data;
            console.log('Search-Users-Data:', result);
        } catch (error) {
            console.error('Error fetching search users data:', error);
        }

    } else {
        document.getElementById('userTablePlaceholder').classList.add('d-none');
        userViewSelectMessage.style.display = 'none';
    }
}

var userInfoValuesArray = [];
var userOrgInfoValuesArray = [];
var userGrpInfoValuesArray = [];
var dict = {};
function addUserFieldToTable() {
    var userAddFieldSelect = document.getElementById('userAddFieldSelect');

    // ##############################
    // Get the selected option
    var selectedOption = userAddFieldSelect.options[userAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################


    var selectedOption = userAddFieldSelect.options[userAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('u-info')) {
        userInfoValuesArray.push(field_val);
    }
    else if (fieldClass.toLowerCase().includes('u-o-info')) {
        userOrgInfoValuesArray.push(field_val);
    }
    else if (fieldClass.toLowerCase().includes('u-g-info')) {
        userGrpInfoValuesArray.push(field_val);
    }

    // Add a new row to the table if a field is selected
    if (field) {
        var table = document.getElementById('userFieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var iconCell = newRow.insertCell(0);
        var fieldCell = newRow.insertCell(1);
        var groupCell = newRow.insertCell(2);
        var typeCell = newRow.insertCell(3);
        var deleteCell = newRow.insertCell(4);

        iconCell.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        fieldCell.textContent = field;
        groupCell.textContent = 'User Information'; // Assuming all fields belong to the "User Information" group
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteUserRow(this)"><i class="bi bi-trash"></i></button>';

        // Reset the select dropdown
        userAddFieldSelect.selectedIndex = 0;
    }
    dict = {
        "userInfoValuesArray": userInfoValuesArray,
        "userOrgInfoValuesArray": userOrgInfoValuesArray,
        "userGrpInfoValuesArray": userGrpInfoValuesArray,
    };
}

function deleteUserRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[1].textContent.trim();

    var addFieldSelect = document.getElementById('userAddFieldSelect');

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

    // Remove the field from arrays only if it matches with the selected option
    if (userInfoValuesArray.includes(selectedOption.value)) {
        var indexComment = userInfoValuesArray.indexOf(selectedOption.value);
        userInfoValuesArray.splice(indexComment, 1);
    }

    if (userOrgInfoValuesArray.includes(selectedOption.value)) {
        var indexComment = userOrgInfoValuesArray.indexOf(selectedOption.value);
        userOrgInfoValuesArray.splice(indexComment, 1);
    }

    if (userGrpInfoValuesArray.includes(selectedOption.value)) {
        var indexComment = userGrpInfoValuesArray.indexOf(selectedOption.value);
        userGrpInfoValuesArray.splice(indexComment, 1);
    }

    dict = {
        "userInfoValuesArray": userInfoValuesArray,
        "userOrgInfoValuesArray": userOrgInfoValuesArray,
        "userGrpInfoValuesArray": userGrpInfoValuesArray,
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}

async function searchUsersData(zendesk_domain, username, token, query) {
    query = query.toString();
    showLoader();
    if (!query) {
        console.error('Invalid search query. Please provide a valid query.');
        hideLoader();
        return Promise.reject('Invalid search query.');
    }

    const auth = `Basic ${btoa(`${username}/token:${token}`)}`;
    const headers = {
        Authorization: auth,
        'Content-Type': 'application/json',
    };

    var user_data = {};

    const url = `${zendesk_domain}/api/v2/search.json?query=type:user ${query}&sort_by=created_at&sort_order=asc`;

    try {
        const response = await client.request(url, {
            method: 'GET',
            headers: headers,
        });

        hideLoader();
        const u_d = response['results'];

        if (response && response.results.length) {
            const searchSelectMessage = $('#userSelectMessage');
            const lengthMessage = 'This view contains ' + response.results.length + ' users.';
            searchSelectMessage.text(lengthMessage).show();
        } else {
            const searchSelectMessage = $('#userSelectMessage');
            const lengthMessage = 'This view contains 0 users.';
            searchSelectMessage.text(lengthMessage).show();
        }

//        const userData = [];
//        for (let i = 0; i < u_d.length; i++) {
//            try {
//                if ('organization_id' in u_d[i]) {
//                    const org_id = u_d[i]['organization_id'];
//                    console.log('org_id-*****', org_id);
//                    if (org_id && org_id !== 'null' && org_id !== undefined) {
//                        const orgUrl = `${zendesk_domain}/api/v2/organizations/${org_id}`;
//                        const orgResponse = await fetch(orgUrl, {
//                            method: 'GET',
//                            headers: {
//                                Authorization: auth,
//                                'Content-Type': 'application/json',
//                            },
//                        });
//                        const orgData = await orgResponse.json();
//                        u_d[i]['organization_data'] = orgData.organization;
//                    } else {
//                        u_d[i]['organization_data'] = {};
//                    }
//                } else {
//                    u_d[i]['organization_id'] = null;
//                    u_d[i]['organization_data'] = {};
//                }
//
//                if ('group_id' in u_d[i]) {
//                    const grp_id = u_d[i]['group_id']; // Use u_d[i] instead of i
//                    console.log('grp_id-*****', grp_id);
//                    if (grp_id && grp_id !== 'null' && grp_id !== undefined) {
//                        const groupUrl = `${zendesk_domain}/api/v2/groups/${grp_id}`;
//                        const groupResponse = await fetch(groupUrl, {
//                            method: 'GET',
//                            headers: {
//                                Authorization: auth,
//                                'Content-Type': 'application/json',
//                            },
//                        });
//                        const groupData = await groupResponse.json();
//                        u_d[i]['group_data'] = groupData.group; // Use u_d[i] instead of i
//                    } else {
//                        u_d[i]['group_data'] = {};
//                    }
//                } else {
//                    u_d[i]['group_id'] = null;
//                    u_d[i]['group_data'] = {};
//                }
//                userData.push(i);
//            } catch (error) {
//                console.error('Error processing user data:', error);
//            }
//            user_data = { 'user_data': userData};
//
//            //user_data = { 'user_data': i};
//        }
        return user_data = { 'user_data': u_d};
    } catch (error) {
        hideLoader();
        console.error('Error fetching search users data:', error);
        return Promise.reject(error); // Reject with the error
    }
}


//function searchUsersData(zendesk_domain, username, token, query) {
//    query = query.toString();
//    showLoader();
//    console.log('Search Query:-', query);
//
//    if (!query) {
//        console.error('Invalid search query. Please provide a valid query.');
//        hideLoader();
//        return Promise.reject('Invalid search query.');
//    }
//
//   const headers = {
//        Authorization: `Basic ${btoa(`${username}/token:${token}`)}`,
//        'Content-Type': 'application/json'
//   };
//
//   console.log(headers);
//    const url = `${zendesk_domain}/api/v2/search.json?query= type:user ${query}&sort_by=created_at&sort_order=asc`;
//    return client.request(url, {
//        type: 'GET',
//        headers: headers,
//    }).then((response) => {
//        console.log('response->->->->', response);
//        hideLoader();
//        u_d = response['results'];
//        if (response && response.results.length) {
//            const searchSelectMessage = $('#userSelectMessage');
//            const lengthMessage = 'This view contains ' + response.results.length + ' users.';
//            searchSelectMessage.text(lengthMessage).show();
//        } else {
//            const searchSelectMessage = $('#userSelectMessage');
//            const lengthMessage = 'This view contains 0 users.';
//            searchSelectMessage.text(lengthMessage).show();
//        }
//        return response;  // Resolve with the response
//    }).catch((error) => {
//        hideLoader();
//        console.error('Error fetching search users data:', error);
//        return Promise.reject(error);  // Reject with the error
//    });
//}


// Function to create a CSV file from selected fields
async function createUsersContent(search_users_data, dict) {
    console.log('i am here....', search_users_data, dict);
    try {
        var selectedFieldsArray = [];

        for (var i = 0; i < search_users_data.length; i++) {
            var user = search_users_data[i];
            console.log('User-----', user);

            var selectedFieldsObject = {};

            // ***************************************************
            // User data
            var selected_users_data = dict['userInfoValuesArray'];

            for (var j = 0; j < selected_users_data.length; j++) {
                try{
                    var field = selected_users_data[j];
                    if (field !== null) {
                        if (user[field] !== null && user[field] !== undefined) {
                            selectedFieldsObject["User_"+field] = '"' + user[field] + '"';
                        }else{
                            selectedFieldsObject[field] = '';
                        }
                    }else{
                        selectedFieldsObject[field] = '';
                    }
                }catch (error) {
                    console.error('Error in Users fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Org data
            var selected_org_data = dict['userOrgInfoValuesArray'];

            for (var j = 0; j < selected_org_data.length; j++) {
                try{
                    var field = selected_org_data[j];
                    selectedFieldsObject["organization_"+field] = '"' + user['organization_data'][field] + '"';
                }catch (error) {
                    console.error('Error in Users fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Group data
            var selected_grp_data = dict['userGrpInfoValuesArray'];

            for (var j = 0; j < selected_grp_data.length; j++) {
                try{
                    var field = selected_grp_data[j];
                    selectedFieldsObject["group_"+field] = '"' + user['group_data'][field] + '"';
                }catch (error) {
                    console.error('Error in Users fields:', error);
                    continue
                }
            }
            // ***************************************************

            selectedFieldsArray.push(selectedFieldsObject);
        }
//        console.log('selectedFieldsArray--', selectedFieldsArray)
//        // Convert the arrays to CSV format
//        var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
//        downloadCSV(csv,'ticket-export.csv');
        console.log("Selected Template:", selected_template);
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
            var xml = convertArrayOfObjectsToXML_user(selectedFieldsArray);
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
        console.error('Error in users create Content function:', error);
    }
}


// Add an event listener to the "Export" button
document.getElementById('search_user_export_Button').addEventListener('click', async function () {
    try {
        console.log('Users onclick users export button:');
        addUserFieldToTable();
        console.log('Users dict data which one you select(fields)', dict);

        console.log('Users data api data your tickets:',Search_Users_Data);
        await createUsersContent(Search_Users_Data, dict);
    } catch (error) {
        console.error('Error fetching onclick users export button:', error);
    }
});
//*********************************************************************************************************
// Function to convert an array of objects to XML format
function convertArrayOfObjectsToXML_user(ticketArray) {
    try {
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<users>\n';

        for (var i = 0; i < ticketArray.length; i++) {
            var ticketObject = ticketArray[i];
            xml += '<user>\n';

            for (var key in ticketObject) {
                if (ticketObject.hasOwnProperty(key)) {
                    // Ensure valid XML element name by replacing invalid characters
                    var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                    xml += `<${sanitizedKey}>${escapeXml(ticketObject[key])}</${sanitizedKey}>\n`;
                }
            }

            xml += '</user>\n';
        }

        xml += '</users>';
        return xml;
    } catch (error) {
        console.error('Error converting array to XML:', error);
        return '';
    }
}

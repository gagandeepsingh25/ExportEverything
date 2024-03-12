var Search_Org_Data = [];
var OrgValuesArray = [];
var dict = {};

// ************************************** search bases organizations *********************************************
// // -----------------Organization ---------------------

// Function to check selections in organization export
async function checkOrganizationSelections() {
    const viewSelect = document.getElementById('OrgQuery');
    const templateSelect = document.getElementById('organizationTemplateSelect');
    const tablePlaceholder = document.getElementById('organizationTablePlaceholder');

    var selectedOption_template = templateSelect.options[templateSelect.selectedIndex];

    var selectedValue_temp = selectedOption_template.value;
    selected_template = selectedValue_temp;

    // Check if both view and template are selected
    if (viewSelect.value && templateSelect.value) {
        // Show the table placeholder
        tablePlaceholder.classList.remove('d-none');

         try {
            const query = viewSelect.value;
            const result = await searchOrganizationData(query);
            Search_Org_Data = result.org_data;
        } catch (error) {
            console.error('Error fetching search org data:', error);
        }
    } else {
        // Hide the table placeholder if either view or template is not selected
        tablePlaceholder.classList.add('d-none');
    }
}


// Function to add organization fields to the table
function addOrganizationFieldToTable() {
    var OrgAddFieldSelect = document.getElementById('organizationAddFieldSelect');
    var field = OrgAddFieldSelect.value;

    // ##############################
    // Get the selected option
    var selectedOption = OrgAddFieldSelect.options[OrgAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################


    var selectedOption = OrgAddFieldSelect.options[OrgAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('o-info')) {
        OrgValuesArray.push(field_val);
    }
//    else if (fieldClass.toLowerCase().includes('u-')) {
//        userOrgInfoValuesArray.push(field_val);
//    }

    // Add a new row to the table if a field is selected
    if (field) {
        var table = document.getElementById('organizationFieldMappingTable').getElementsByTagName('tbody')[0];
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
        deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteOrgRow(this)"><i class="bi bi-trash"></i></button>';

        // Reset the select dropdown
        userAddFieldSelect.selectedIndex = 0;
    }
    dict = {
        "OrgValuesArray": OrgValuesArray,
    };
}



function deleteOrgRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[1].textContent.trim();

    var addFieldSelect = document.getElementById('organizationAddFieldSelect');

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
    if (OrgValuesArray.includes(selectedOption.value)) {
        var indexComment = OrgValuesArray.indexOf(selectedOption.value);
        OrgValuesArray.splice(indexComment, 1);
    }

    dict = {
        "OrgValuesArray": OrgValuesArray,
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


async function searchOrganizationData(query) {
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
    const url = `${zendesk_domain}/api/v2/search.json?query=type:organization name:${query}&sort_by=created_at&sort_order=asc`;
    try {
        const response = await client.request(url, {
            method: 'GET',
            headers: headers,
        });

        hideLoader();
        const o_d = response['results'];
        if (response && response.results.length) {
            const searchSelectMessage = $('#searchOrgSelectMessage');
            const lengthMessage = 'This view contains ' + response.results.length + ' organizations.';
            searchSelectMessage.text(lengthMessage).show();
        } else {
            const searchSelectMessage = $('#searchOrgSelectMessage');
            const lengthMessage = 'This view contains 0 organizations.';
            searchSelectMessage.text(lengthMessage).show();
        }

        return user_data = { 'org_data': o_d};
    } catch (error) {
        hideLoader();
        console.error('Error fetching search users data:', error);
        return Promise.reject(error); // Reject with the error
    }
}
// Function to create a CSV file from selected fields
async function createOrganizationContent(Search_Org_Data, dict) {
    try {
        var selectedFieldsArray = [];
        for (var i = 0; i < Search_Org_Data.length; i++) {
            var org = Search_Org_Data[i];
            var selectedFieldsObject = {};

            // ***************************************************
            // Organization data
            var selected_org_data = dict['OrgValuesArray'];

            for (var j = 0; j < selected_org_data.length; j++) {
                try{
                    var field = selected_org_data[j];
                    if (field !== null) {
                        if (org[field] !== null && org[field] !== undefined) {
                            selectedFieldsObject["Organization_"+field] = '"' + org[field] + '"';
                        }else{
                            selectedFieldsObject[field] = '';
                        }
                    }else{
                        selectedFieldsObject[field] = '';
                    }
                }catch (error) {
                    console.error('Error in orggg fields:', error);
                    continue
                }
            }
            // ***************************************************

            selectedFieldsArray.push(selectedFieldsObject);
        }
//        // Convert the arrays to CSV format
//        var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
//        downloadCSV(csv,'ticket-export.csv');

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
            var xml = convertArrayOfObjectsToXML_org(selectedFieldsArray);
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
        console.error('Error in org create Content function:', error);
    }
}

// Add an event listener to the "Export" button
document.getElementById('search_org_export_Button').addEventListener('click', async function () {
    try {
        addOrganizationFieldToTable();
        await createOrganizationContent(Search_Org_Data, dict);
    } catch (error) {
        console.error('Error fetching onclick search based Organization export button:', error);
    }
});


// ************************************** time bases organizations *********************************************

async function checkOrganizationSelections_time() {
    var orgViewSelect = document.getElementById('orgtemplateSelect_time');

    var selectedOption_template = orgViewSelect.options[orgViewSelect.selectedIndex];

    var selectedValue_temp = selectedOption_template.value;
    selected_template = selectedValue_temp;

    if (orgViewSelect.value) {
        showLoader();
        document.getElementById('OrgTimeTablePlaceholder').classList.remove('d-none');
        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        Search_Org_Data = await fetchTimeBasedOrganizationData(t_start, t_end)
        if (Search_Org_Data && Search_Org_Data.length) {
            hideLoader();
            var viewSelectMessage = $('#timeOrgSelectMessage');
            var lengthMessage = 'This view contains' + Search_Org_Data.length + ' organizations.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#timeOrgSelectMessage');
            var lengthMessage = 'This view contains 0 organizations.';
            viewSelectMessage.text(lengthMessage).show();
        }
    } else {
        document.getElementById('OrgTimeTablePlaceholder').classList.add('d-none');
        hideLoader();
    }
    return Search_Org_Data;
}

async function fetchTimeBasedOrganizationData(start, end) {
    var organizationsArray = [];
    try {
        var url = `${zendesk_domain}/api/v2/incremental/organizations.json?start_time=${start}&end_time=${end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        organizationsArray = data['organizations'];
    } catch (error) {
        console.error('Error fetching org ticket info:---', error);
    }
    return organizationsArray;
}

// Function to add organization fields to the table
function addOrganizationFieldToTable_time() {
    var OrgAddFieldSelect = document.getElementById('organizationAddFieldSelect_time');
    var field = OrgAddFieldSelect.value;

    // ##############################
    // Get the selected option
    var selectedOption = OrgAddFieldSelect.options[OrgAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################


    var selectedOption = OrgAddFieldSelect.options[OrgAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('o-info')) {
        OrgValuesArray.push(field_val);
    }
//    else if (fieldClass.toLowerCase().includes('u-')) {
//        userOrgInfoValuesArray.push(field_val);
//    }

    // Add a new row to the table if a field is selected
    if (field) {
        var table = document.getElementById('organizationFieldMappingTable_time').getElementsByTagName('tbody')[0];
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
        deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteTimeOrgRow(this)"><i class="bi bi-trash"></i></button>';

        // Reset the select dropdown
        userAddFieldSelect.selectedIndex = 0;
    }
    dict = {
        "OrgValuesArray": OrgValuesArray,
    };
}

function deleteTimeOrgRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[1].textContent.trim();

    var addFieldSelect = document.getElementById('organizationAddFieldSelect_time');

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
    if (OrgValuesArray.includes(selectedOption.value)) {
        var indexComment = OrgValuesArray.indexOf(selectedOption.value);
        OrgValuesArray.splice(indexComment, 1);
    }

    dict = {
        "OrgValuesArray": OrgValuesArray,
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// Add an event listener to the "Export" button
document.getElementById('time_org_export_Button').addEventListener('click', async function () {
    try {
        addOrganizationFieldToTable_time();
        await createOrganizationContent(Search_Org_Data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based Organization export button:', error);
    }
});
//**********************************************************************************************************


// Function to convert an array of objects to XML format
function convertArrayOfObjectsToXML_org(ticketArray) {
    try {
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<organizations>\n';

        for (var i = 0; i < ticketArray.length; i++) {
            var ticketObject = ticketArray[i];
            xml += '<organization>\n';

            for (var key in ticketObject) {
                if (ticketObject.hasOwnProperty(key)) {
                    // Ensure valid XML element name by replacing invalid characters
                    var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                    xml += `<${sanitizedKey}>${escapeXml(ticketObject[key])}</${sanitizedKey}>\n`;
                }
            }

            xml += '</organization>\n';
        }

        xml += '</organizations>';
        return xml;
    } catch (error) {
        console.error('Error converting array to XML:', error);
        return '';
    }
}
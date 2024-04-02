// ******** Calls ********
var CallsValuesArray = [];
var LegsValuesArray = [];
var calls_api_data = [];
var legs_api_data = [];
var dict = {};
var selected_template;

// Function to check selections in Calls Export component
async function checkCallSelections() {
   var callTemplateSelect = document.getElementById('callTemplateSelect');
   var tablePlaceholder = document.getElementById('callTablePlaceholder');

   var selectedOption_template = callTemplateSelect.options[callTemplateSelect.selectedIndex];
   var selectedValue_temp = selectedOption_template.value;

   selected_template = selectedValue_temp;

   if (callTemplateSelect.value) {
       document.getElementById('callTablePlaceholder').classList.remove('d-none');

        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        calls_api_data = await SearchCallsInfo(t_start, t_end)
        if (calls_api_data && calls_api_data.length) {
            hideLoader();
            var viewSelectMessage = $('#callsSelectMessage');
            var lengthMessage = 'This view contains  ' + calls_api_data.length + ' calls.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#callsSelectMessage');
            var lengthMessage = 'This view contains 0 calls.';
            viewSelectMessage.text(lengthMessage).show();
        }
   } else {
       document.getElementById('callTablePlaceholder').classList.add('d-none');
   }
}


// Function to add call field to the table in Calls Export component
function addCallFieldToTable() {
   var callAddFieldSelect = document.getElementById('callAddFieldSelect');
   var field = callAddFieldSelect.value;

    // ##############################
    // Get the selected option
    var selectedOption = callAddFieldSelect.options[callAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = callAddFieldSelect.options[callAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('c-info')) {
        CallsValuesArray.push(field_val);
    }

   // Add a new row to the table if a field is selected
   if (field) {
       var table = document.getElementById('callFieldMappingTable').getElementsByTagName('tbody')[0];
       var newRow = table.insertRow();
       var iconCell = newRow.insertCell(0);
       var fieldCell = newRow.insertCell(1);
       var groupCell = newRow.insertCell(2);
       var typeCell = newRow.insertCell(3);
       var deleteCell = newRow.insertCell(4);

       iconCell.innerHTML = '<i class="bi bi-grip-vertical"></i>';
       fieldCell.textContent = field;
       groupCell.textContent = 'Call'; // Assuming all fields belong to the "Call" group
       typeCell.textContent = type;
       deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteCallRow(this)"><i class="bi bi-trash"></i></button>';

       // Reset the select dropdown
       callAddFieldSelect.selectedIndex = 0;
   }
   dict = {
        "CallsValuesArray": CallsValuesArray,
    };
}

// Function to delete call row from table in Calls Export component
//function deleteCallRow(btn) {
//   var row = btn.closest('tr');
//   row.parentNode.removeChild(row);
//}


function deleteCallRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[0].textContent.trim();

    // Show the corresponding option in the select element
    var addFieldSelect = document.getElementById('callAddFieldSelect');
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

    if (CallsValuesArray.includes(selectedOption.value)) {
        var indexComment = CallsValuesArray.indexOf(selectedOption.value);
        CallsValuesArray.splice(indexComment, 1);
    }

    dict = {
        "CallsValuesArray": CallsValuesArray,
    };

    // Un hide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// FETCH COMMENT DATA FROM API
async function SearchCallsInfo(t_start, t_end) {
    try {
        var Updated_Array = [];
        var url = `${zendesk_domain}/api/v2/channels/voice/stats/incremental/calls?start_time=${t_start}&end_time=${t_end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        Updated_Array = data['calls'];
//        for (var i = 0; i < ticketsArray.length; i++) {
//            var ticket = ticketsArray[i];
//            var par_dict =
//                {'requester_id': ticket['requester_id'],
//                 'submitter_id': ticket['submitter_id'],
//                 'assignee_id': ticket['assignee_id'],
//                 'organization_id': ticket['organization_id'],
//                 'group_id': ticket['group_id'],
//                 'ticket_form_id': ticket['ticket_form_id'],
//                 'brand_id': ticket['brand_id'],
//                 'custom_status_id': ticket['custom_status_id'],
//                 'id': ticket["id"]
//                 };
//
//            var ApiData = await fetchRequesterData(par_dict);
//            ticket = {
//                ...ticket,
//                ...ApiData
//            };
//            Updated_Array.push(ticket);
//        }
    } catch (error) {
        console.error('Error fetching comments ticket info:---', error);
    }
    return Updated_Array;
}


// Function to create a CSV file from selected fields
async function createCallsContent(calls_api_data, dict) {
    try {
        var selectedFieldsArray = [];

        for (var i = 0; i < calls_api_data.length; i++) {
            var ticket = calls_api_data[i];

            // ***************************************************
            var selectedFieldsObject = {};
            // Export Ticket
            var select_fields_data = dict['CallsValuesArray'];

            for (var j = 0; j < select_fields_data.length; j++) {
                try{
                    var field = select_fields_data[j];
                    if (field !== null) {
                        if (ticket[field] !== null && ticket[field] !== undefined) {
                            selectedFieldsObject["Calls_" + field] = '"' + ticket[field].toString() + '"';
                        } else {
                            selectedFieldsObject[field] = '';  // or handle the case where ticket[field] is null or undefined
                        }
                    } else {
                        selectedFieldsObject[field] = '';  // or handle the case where field is null
                    }
                }catch (error) {
                    console.error('Error in Calls fields:', error);
                    continue
                }
            }
            selectedFieldsArray.push(selectedFieldsObject);
        }
        if (selected_template == 'JSON'){
            // Convert the arrays to JSON format
            var jsonContent = JSON.stringify(selectedFieldsArray, null, 2);
            if(jsonContent) {
                downloadJSON(jsonContent, 'calls-export.json');
            } else {
                console.error('Error generating JSON data.');
            }
        }else if (selected_template == 'XML') {
            // Convert the arrays to XML format
            var xml = convertArrayOfObjectsToXML(selectedFieldsArray);
            if(xml) {
                downloadXML(xml, 'calls-export.xml');
            } else {
                console.error('Error generating XML data.');
            }
        }else{
            var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
            if (csv) {
                downloadCSV(csv, 'calls-export.csv');
            } else {
                console.error('Error generating CSV data.');
            }
        }
    } catch (error) {
        console.error('Error in create calls Content function:', error);
    }
}

// Add an event listener to the "Export" button
document.getElementById('time_calls_export_Button').addEventListener('click', async function () {
    try {
        addCallFieldToTable();
        await createCallsContent(calls_api_data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based calls export button:', error);
    }
});

//**********************************************************************************************************
// ******** Legs ********

// Function to check selections in Legs Export component
async function checkLegsSelections() {
   var legsTemplateSelect = document.getElementById('legsTemplateSelect');
   var tablePlaceholder = document.getElementById('legsTablePlaceholder');

   var selectedOption_template = callTemplateSelect.options[callTemplateSelect.selectedIndex];
   var selectedValue_temp = selectedOption_template.value;

   selected_template = selectedValue_temp;

   if (legsTemplateSelect.value) {
       document.getElementById('legsTablePlaceholder').classList.remove('d-none');

        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        legs_api_data = await SearchLegsInfo(t_start, t_end)
        if (legs_api_data && legs_api_data.length) {
            hideLoader();
            var viewSelectMessage = $('#legsSelectMessage');
            var lengthMessage = 'This view contains  ' + calls_api_data.length + ' legs.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#legsSelectMessage');
            var lengthMessage = 'This view contains 0 legs.';
            viewSelectMessage.text(lengthMessage).show();
        }
   } else {
       document.getElementById('legsTablePlaceholder').classList.add('d-none');
   }
}

// Function to add legs field to the table in Legs Export component
function addLegsFieldToTable() {
   var legsAddFieldSelect = document.getElementById('legsAddFieldSelect');
   var field = legsAddFieldSelect.value;

    // ##############################
    // Get the selected option
    var selectedOption = legsAddFieldSelect.options[legsAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = legsAddFieldSelect.options[legsAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('l-info')) {
        LegsValuesArray.push(field_val);
    }
   if (field) {
       var table = document.getElementById('legsFieldMappingTable').getElementsByTagName('tbody')[0];
       var newRow = table.insertRow();
       var iconCell = newRow.insertCell(0);
       var fieldCell = newRow.insertCell(1);
       var groupCell = newRow.insertCell(2);
       var typeCell = newRow.insertCell(3);
       var deleteCell = newRow.insertCell(4);

       iconCell.innerHTML = '<i class="bi bi-grip-vertical"></i>';
       fieldCell.textContent = field;
       groupCell.textContent = 'Leg'; // Assuming all fields belong to the "Leg" group
       typeCell.textContent = type;
       deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteLegsRow(this)"><i class="bi bi-trash"></i></button>';

       // Reset the select dropdown
       legsAddFieldSelect.selectedIndex = 0;
   }
   dict = {
        "LegsValuesArray": LegsValuesArray,
   };
}

//// Function to delete legs row from table in Legs Export component
//function deleteLegsRow(btn) {
//   var row = btn.closest('tr');
//   row.parentNode.removeChild(row);
//}

function deleteLegsRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[0].textContent.trim();

    // Show the corresponding option in the select element
    var addFieldSelect = document.getElementById('legsAddFieldSelect');
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

    if (LegsValuesArray.includes(selectedOption.value)) {
        var indexComment = LegsValuesArray.indexOf(selectedOption.value);
        LegsValuesArray.splice(indexComment, 1);
    }

    dict = {
        "LegsValuesArray": LegsValuesArray,
   };

    // Un hide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// FETCH COMMENT DATA FROM API
async function SearchLegsInfo(t_start, t_end) {
    try {
        var Updated_Array = [];
        var url = `${zendesk_domain}/api/v2/channels/voice/stats/incremental/legs?start_time=${t_start}&end_time=${t_end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        Updated_Array = data['legs'];

//        for (var i = 0; i < ticketsArray.length; i++) {
//            var ticket = ticketsArray[i];
//            var par_dict =
//                {'requester_id': ticket['requester_id'],
//                 'submitter_id': ticket['submitter_id'],
//                 'assignee_id': ticket['assignee_id'],
//                 'organization_id': ticket['organization_id'],
//                 'group_id': ticket['group_id'],
//                 'ticket_form_id': ticket['ticket_form_id'],
//                 'brand_id': ticket['brand_id'],
//                 'custom_status_id': ticket['custom_status_id'],
//                 'id': ticket["id"]
//                 };
//
//            var ApiData = await fetchRequesterData(par_dict);
//            ticket = {
//                ...ticket,
//                ...ApiData
//            };
//            Updated_Array.push(ticket);
//        }
    } catch (error) {
        console.error('Error fetching comments ticket info:---', error);
    }
    return Updated_Array;
}


// Function to create a CSV file from selected fields
async function createLegsContent(legs_api_data, dict) {
    try {
        var selectedFieldsArray = [];

        for (var i = 0; i < legs_api_data.length; i++) {
            var ticket = legs_api_data[i];

            // ***************************************************
            var selectedFieldsObject = {};
            // Export Ticket
            var select_fields_data = dict['LegsValuesArray'];

            for (var j = 0; j < select_fields_data.length; j++) {
                try{
                    var field = select_fields_data[j];
                    if (field !== null) {
                        if (ticket[field] !== null && ticket[field] !== undefined) {
                            selectedFieldsObject["Legs_" + field] = '"' + ticket[field].toString() + '"';
                        } else {
                            selectedFieldsObject[field] = '';  // or handle the case where ticket[field] is null or undefined
                        }
                    } else {
                        selectedFieldsObject[field] = '';  // or handle the case where field is null
                    }
                }catch (error) {
                    console.error('Error in Legs fields:', error);
                    continue
                }
            }
            selectedFieldsArray.push(selectedFieldsObject);
        }
        if (selected_template == 'JSON'){
            // Convert the arrays to JSON format
            var jsonContent = JSON.stringify(selectedFieldsArray, null, 2);
            if(jsonContent) {
                downloadJSON(jsonContent, 'legs-export.json');
            } else {
                console.error('Error generating JSON data.');
            }
        }else if (selected_template == 'XML') {
            // Convert the arrays to XML format
            var xml = convertArrayOfObjectsToXML(selectedFieldsArray);
            if(xml) {
                downloadXML(xml, 'legs-export.xml');
            } else {
                console.error('Error generating XML data.');
            }
        }else{
            var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
            if (csv) {
                downloadCSV(csv, 'legs-export.csv');
            } else {
                console.error('Error generating CSV data.');
            }
        }
    } catch (error) {
        console.error('Error in create legs Content function:', error);
    }
}

// Add an event listener to the "Export" button
document.getElementById('time_legs_export_Button').addEventListener('click', async function () {
    try {
        addLegsFieldToTable();
        await createLegsContent(legs_api_data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based legs export button:', error);
    }
});
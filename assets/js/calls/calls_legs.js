// ******** Calls ********
var CallsValuesArray = [];
var LegsValuesArray = [];
var calls_api_data = [];
var legs_api_data = [];
var dict = {};
// Function to check selections in Calls Export component
function checkCallSelections() {
   var callTemplateSelect = document.getElementById('callTemplateSelect');

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
function deleteCallRow(btn) {
   var row = btn.closest('tr');
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


// Add an event listener to the "Export" button
document.getElementById('time_calls_export_Button').addEventListener('click', async function () {
    try {
        addCallFieldToTable();
        //await createOrganizationContent(Search_Org_Data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based calls export button:', error);
    }
});

//**********************************************************************************************************
// ******** Legs ********

// Function to check selections in Legs Export component
function checkLegsSelections() {
   var legsTemplateSelect = document.getElementById('legsTemplateSelect');

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

// Function to delete legs row from table in Legs Export component
function deleteLegsRow(btn) {
   var row = btn.closest('tr');
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


// Add an event listener to the "Export" button
document.getElementById('time_legs_export_Button').addEventListener('click', async function () {
    try {
        addLegsFieldToTable();
        //await createOrganizationContent(Search_Org_Data, dict);
    } catch (error) {
        console.error('Error fetching onclick time based legs export button:', error);
    }
});
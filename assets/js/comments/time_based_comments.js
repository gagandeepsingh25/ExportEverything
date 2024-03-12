var tickets_data = [];
async function checkCommentSelections(){
    var commentTemplateSelect = document.getElementById('commentTemplateSelect');

    var selectedOption_template = commentTemplateSelect.options[commentTemplateSelect.selectedIndex];
    var selectedValue_temp = selectedOption_template.value;

    selected_template = selectedValue_temp;

    if (selectedOption_template.value) {
        showLoader();
        document.getElementById('commentTablePlaceholder').classList.remove('d-none');

        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        tickets_data = await commentInfo(t_start, t_end)
        if (tickets_data && tickets_data.length) {
            hideLoader();
            var viewSelectMessage = $('#commentSelectMessage');
            var lengthMessage = 'This view contains' + tickets_data.length + ' comments.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#commentSelectMessage');
            var lengthMessage = 'This view contains 0 comments.';
            viewSelectMessage.text(lengthMessage).show();
        }

    } else {
        hideLoader();
        document.getElementById('commentTablePlaceholder').classList.add('d-none');
        commentViewSelectMessage.style.display = 'none';
    }
    return tickets_data;
}

var commentValuesArray = [];
var auditValuesArray = [];
var dict = {};
function addCommentFieldToTable() {
    var commentAddFieldSelect = document.getElementById('commentAddFieldSelect');

    // ##############################
    // Get the selected option
    var selectedOption = commentAddFieldSelect.options[commentAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = commentAddFieldSelect.options[commentAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';

    if (fieldClass.toLowerCase().includes('c-comment')) {
        commentValuesArray.push(field_val);
    } else if (fieldClass.toLowerCase().includes('a-audit')) {
        auditValuesArray.push(field_val);
    }

    // Add a new row to the table if a field is selected
    if (field) {
        var table = document.getElementById('commentFieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var iconCell = newRow.insertCell(0);
        var fieldCell = newRow.insertCell(1);
        var groupCell = newRow.insertCell(2);
        var typeCell = newRow.insertCell(3);
        var deleteCell = newRow.insertCell(4);

        iconCell.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        fieldCell.textContent = field;
        groupCell.textContent = 'Comment'; // Assuming all fields belong to the "Comment" group
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteCommentRow(this)"><i class="bi bi-trash"></i></button>';

        // Reset the select dropdown
        commentAddFieldSelect.selectedIndex = 0;
    }
    dict = {
        "commentValuesArray": commentValuesArray,
        "auditValuesArray": auditValuesArray,
    };
}


function deleteCommentRow(btn) {
    var row = btn.closest('tr');
    var fieldValue = row.cells[1].textContent.trim();

    var addFieldSelect = document.getElementById('commentAddFieldSelect');

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
    if (commentValuesArray.includes(selectedOption.value)) {
        var indexComment = commentValuesArray.indexOf(selectedOption.value);
        commentValuesArray.splice(indexComment, 1);
    }

    if (auditValuesArray.includes(selectedOption.value)) {
        var indexAudit = auditValuesArray.indexOf(selectedOption.value);
        auditValuesArray.splice(indexAudit, 1);
    }

    // Update the global dict object
    dict = {
        "commentValuesArray": commentValuesArray,
        "auditValuesArray": auditValuesArray,
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// FETCH COMMENT DATA FROM API
async function commentInfo(start, end) {
    try {
        var Updated_Array = [];
        var url = `${zendesk_domain}/api/v2/incremental/tickets.json?start_time=${start}&end_time=${end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        const ticketsArray = data['tickets'];

        for (var i = 0; i < ticketsArray.length; i++) {
            var ticket = ticketsArray[i];

            var CommentApiData = await fetchCommentData(ticket["id"]);
            var AuditApiData = await fetchAuditsData(ticket["id"]);

            var new_dict = {
                'comment_data':CommentApiData[0],
                'audit_data':AuditApiData[0]
            }
            Updated_Array.push(new_dict);
        }
    } catch (error) {
        console.error('Error fetching comments ticket info:---', error);
    }
    return Updated_Array;
}

async function fetchCommentData(id) {
    var commentsData = [];
    try {
        var url = `${zendesk_domain}/api/v2/tickets/${id}/comments`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const Data = await client.request(settings);
        commentsData = Data['comments'];
    } catch (error) {
            console.error('Error fetching comments data info:---', error);
        }
    return commentsData;
}

async function fetchAuditsData(id) {
    var auditData = [];
    try {
        var url = `${zendesk_domain}/api/v2/tickets/${id}/audits`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        const data = await client.request(settings);
        auditData = data['audits'];
    } catch (error) {
            console.error('Error fetching audit data info:---', error);
        }
    return auditData;
}


// Function to create a CSV file from selected fields
async function createCommentsContent(tickets_data, dict) {
    try {
        var selectedFieldsArray = [];

        for (var i = 0; i < tickets_data.length; i++) {
            var ticket = tickets_data[i];

            var selectedFieldsObject = {};

            // ***************************************************
            // Comment data
            var select_comment_data = dict['commentValuesArray'];

            for (var j = 0; j < select_comment_data.length; j++) {
                try{
                    var field = select_comment_data[j];
                    if (['body', 'html_body'].includes(field)) {
                        selectedFieldsObject[field] = '"' + ticket['comment_data'][field].replace(/"/g, '""') + '"';
                    } else {
                        selectedFieldsObject[field] = '"' + ticket['comment_data'][field] + '"';
                    }
                }catch (error) {
                    console.error('Error in Comment fields:', error);
                    continue
                }
            }
            // ***************************************************
            // Audit data
            var select_audit_data = dict['auditValuesArray'];

            for (var j = 0; j < select_audit_data.length; j++) {
                try{
                    var field = select_audit_data[j];
                    if('channel' == field){
                        selectedFieldsObject['channel'] = '"' + ticket['audit_data']['via'][field].toString() + '"';
                    }
                    else if('address' == field){
                        if (ticket['audit_data']['via']['source']['to']['address']){
                            selectedFieldsObject['raw_address'] = '"' + ticket['audit_data']['via']['source']['to']['address'].toString() + '"';
                        }else{
                            selectedFieldsObject['raw_address'] = '';
                        }
                    }
                    else if('json_address' == field){
                        if (ticket['audit_data']['via']['source']['to']['address']){
                            selectedFieldsObject['json_address'] = '"' + ticket['audit_data']['via']['source']['to']['address'].toString() + '"';
                        }else{
                            selectedFieldsObject['json_address'] = '';
                        }
                    }
                    else if('client' == field){
                        selectedFieldsObject['client'] = '"' + ticket['audit_data']['metadata']['system'][field].toString() + '"';
                    }
                    else if('location' == field){
                        selectedFieldsObject['location'] = '"' + ticket['audit_data']['metadata']['system'][field].toString() + '"';
                    }
                    else if('latitude' == field){
                        selectedFieldsObject['latitude'] = '"' + ticket['audit_data']['metadata']['system'][field].toString() + '"';
                    }
                    else if('longitude' == field){
                        selectedFieldsObject['longitude'] = '"' + ticket['audit_data']['metadata']['system'][field].toString() + '"';
                    }
                    else if('ip_address' == field){
                        selectedFieldsObject['ip_address'] = '"' + ticket['audit_data']['metadata']['system'][field].toString() + '"';
                    }
                    else if('created_at' == field){
                        selectedFieldsObject['created_at'] = '"' + ticket['audit_data'][field].toString() + '"';
                    }
                    else if('author_id' == field){
                        selectedFieldsObject['author_id'] = '"' + ticket['audit_data'][field].toString() + '"';
                    }
                    else if('id' == field){
                        selectedFieldsObject['audit_id'] = '"' + ticket['audit_data'][field].toString() + '"';
                    }
                    else{
                        selectedFieldsObject[field] = '"' + ticket['audit_data'][field].toString() + '"';
                    }
                }catch (error) {
                    console.error('Error in Audit fields:', error);
                    continue
                }
            }
            selectedFieldsArray.push(selectedFieldsObject);
        }
//        // Convert the arrays to CSV format
//        var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
//        downloadCSV(csv, 'ticket-export.csv');
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
            var xml = convertArrayOfObjectsToXML_comment(selectedFieldsArray);
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
        console.error('Error in comment create Content function:', error);
    }
}


// Add an event listener to the "Export" button
document.getElementById('comment_export_Button').addEventListener('click', async function () {
    try {
        addCommentFieldToTable();
        await createCommentsContent(tickets_data, dict);
    } catch (error) {
        console.error('Error fetching onclick comments export button:', error);
    }
});

// *******************************************************************************************************
// Function to convert an array of objects to XML format
function convertArrayOfObjectsToXML_comment(ticketArray) {
    try {
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<comments>\n';

        for (var i = 0; i < ticketArray.length; i++) {
            var ticketObject = ticketArray[i];

            xml += '<comment>\n';

            for (var key in ticketObject) {
                if (ticketObject.hasOwnProperty(key)) {
                    // Ensure valid XML element name by replacing invalid characters
                    var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                    xml += `<${sanitizedKey}>${escapeXml(ticketObject[key])}</${sanitizedKey}>\n`;
                }
            }

            xml += '</comment>\n';
        }

        xml += '</comments>';
        return xml;
    } catch (error) {
        console.error('Error converting array to XML:', error);
        return '';
    }
}
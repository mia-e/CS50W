//js file 
document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('form').onsubmit = send_composed;    
    document.querySelector('.reply-button').style.display = 'none';

    // By default, load the inbox
    load_mailbox('inbox');
});



function compose_email() {
    document.querySelector('.reply-button').style.display = 'none';
    document.getElementById('submit-button').style.display = 'block';
    document.getElementById('recipients-div').style.display = 'block';
    document.getElementById('compose-subject').style.display = 'block';
    let body = document.getElementById('compose-body')
    body.disabled = false;

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //load all emails 
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(email => email_view(email, mailbox));

    // ... do something else with emails ...
});
}

function send_composed() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });

      localStorage.clear();
      load_mailbox('sent');
      return false;
}

function email_view(email, mailbox){
    //allow for email to be seen 
    const email_div = document.createElement('div');
    email_div.id = 'email';

    //get the recipietn
    const email_recipients = document.createElement('div');
    email_recipients.id = 'email-recipient';
    //email_recipients.className = 'col-lg-2 col-md-3 col-sm-12';
    console.log(`Mailbox: ${mailbox}`);
    if (mailbox === 'inbox'){
        //if its the inboc then 
        email_recipients.innerHTML = email.sender;
    }else {
            email_recipients.innerHTML = email.recipients[0];
        }
    email_div.append(email_recipients);


    //email subject 
    const email_subject = document.createElement('div');
    email_subject.id = 'email-subject';
    //email_recipients.className = 'col-lg-6 col-md-5 col-sm-12';
    email_subject.innerHTML = email.subject;
    email_div.append(email_subject);


    //timestamp
    const email_timestamp = document.createElement('div');
    email_timestamp.id = 'email-timestamp';
    //email_timestamp.className = 'col-lg-3 col-md-3 col-sm-12';
    email_timestamp.innerHTML = email.timestamp;
    email_div.append(email_timestamp);


    //archive button for mail
    console.log(mailbox);
    if (mailbox!== 'sent') {
        const archive_button = document.createElement('img');
        archive_button.id = "archive-button";
        archive_button.src = "static/mail/archive.jpg"; 
        archive_button.innerHTML = "Archive Email";
        email_div.append(archive_button);
        archive_button.addEventListener('click', () => archive_email(email.id, email.archived));
    }
    
    const email_card = document.createElement('div');
    email_card.id = 'email-card';
    email_card.style.border = "1px solid rgba(0,0,0,.125)";
    if (email.read && mailbox !== 'sent'){
        email_card.className = "read";
        email_card.style.backgroundColor = "lightgrey";
    }
    else{
        email_card.className = "card";
    }
    email_card.append(email_div);


    email_recipients.addEventListener('click', () => open_email(email.id) );
    email_subject.addEventListener('click', () => open_email(email.id) );
    email_timestamp.addEventListener('click', () => open_email(email.id) );
    document.querySelector('#emails-view').append(email_card);

} 

function open_email(email_id){
    const reply_button = document.querySelector('.reply-button')
    reply_button.style.display = 'block';
    document.getElementById('submit-button').style.display = 'none';
    document.getElementById('recipients-div').style.display = 'none';
    document.getElementById('compose-subject').style.display = 'none';
    let body = document.getElementById('compose-body')
    body.disabled = true;
   // Show compose view and hide other views
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';

   // Clear out composition fields
   document.querySelector('#compose-recipients').value = '';
   document.querySelector('#compose-subject').value = '';
   document.querySelector('#compose-body').value = '';

   //display the email (change div values and placeholders )
   fetch(`/emails/${email_id}`)
    .then(response => response.json())  
    .then(email => {
    // Print email
        email_markRead(email_id);
        console.log(email);

        document.querySelector('.header').innerHTML = email.subject;
        document.querySelector('#from-div').value = email.sender;
        body.value = email.body;    

        reply_button.addEventListener('click', () => reply_email(email));

    // ... do something else with email ...
});  
   
}

function reply_email(email){
    compose_email();
    document.getElementById('from-div').value = email.recipients;
    document.getElementById('compose-recipients').value = email.sender;
    document.getElementById('compose-subject').value = `Re: ${email.subject}`;
    document.getElementById('compose-body').value = `On: ${email.timestamp} ${email.sender} wrote: ${email.body}`;

  }

function email_markRead(email_id){
    console.log('email is read');
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

}
  

function archive_email(email_id, value){
    //replace archive value
    const archiveValue = !value;
    console.log(`updating email archive value as ${archiveValue}` );
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: archiveValue
        })
      })
    load_mailbox('inbox');
    window.location.reload();
}




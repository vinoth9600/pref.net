const PUB = window.postMessage;
const SUB = window.addEventListener;

// Iframe Configuration to render preference center.
const CREDENTIALS = {
    tenantId: "app~eb250dbe-3781-4f87-b031-b802f5125913",
    preferenceCenterId: "781e14e2-d9bf-4b86-8e0b-2c273c30d724",
    primaryIdentifier: 'email',
    locationCode: 'ID',
    languageCode: 'id',
    implicitFlow: true,
    implicitRecordConsents: false,
    allMandatory: false
};

(function () {
    //? STEP 1: subscribe to window events
    SUB("message", handleWindowEvents);

    //? STEP 2: Get the iframe ref and add an onload event listener.
    // As and when iframe loaded(i.e, preference center) client/parent window can send the information that iframe needs
    // in order to load the consents.
    const preferenceIframeRef = document.getElementById("preferenceIframe");

    preferenceIframeRef.addEventListener("load", (ev) => {
        //? STEP 3: Load the config into iframe/sdk.
        loadConfigIntoIframe()
    });

    //? STEP 4: Attach a listener to the primary identifier and let the iframe know about the change.
    const primaryIdentifierRef = document.getElementById('email');
    primaryIdentifierRef.addEventListener('input', handlePrimaryIdChange);

    // primary identifier already provided then update ui
    if (CREDENTIALS.primaryIdentifier) {
        primaryIdentifierRef.value = CREDENTIALS.primaryIdentifier;
    }

    // Load config into iframe.
    function loadConfigIntoIframe() {
        //? Step 2: Load Credentials into iframe.
        PUB(
            {
                type: "INIT_PREFERENCE_CENTER",
                config: CREDENTIALS
            },
            '*'
        );
    }

    // Subscribing iframe events.
    function handleWindowEvents(evt) {
        const evtType = getEventType(evt);

        // CONSENTS_PROVIDED EVENT 
        // fired when user clicks on submit.
        if (evtType.toUpperCase() === 'CONSENTS_PROVIDED') {
            PUB({
                type: "RECORD_CONSENTS",
                value: true
            }, '*');
        }else if(evtType.toUpperCase() === 'USER_CONSENTS_SNAPSHOT') {
            // This will be fired when `GET_USER_CONSENTS_SNAPSHOT` event
            // is fired fromm parent window.

            // Consents snapshot
            // client/tenant can save this and pass it again to prepopulate the form.
            const consents = evt.data
        }
    }

    // Update primary identifer in sdk.
    function handlePrimaryIdChange(ev) {
        const value = ev.target.value;
        PUB({
            type: 'SET_PRIMARY_IDENTIFIER',
            value: value
        }, '*')
    }
    
    // We will get all the consents user has given
    // in `USER_CONSENTS_SNAPSHOT` when this event is fired.
    function getUserConsentsSnapshot() {
        PUB({
            type: 'GET_USER_CONSENTS_SNAPSHOT'
        }, '*')
    }

    // To unsubscribe window events.
    function unsubscribeWindowEvents() {
        window.removeEventListener('message', handleWindowEvents);
    }
    /** END OF OPTIONAL STEPS */

    function getEventType(evt) {
        return evt.data.type || "UNKNOWN";
    }

})();
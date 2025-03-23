const action = require('./action')
// Example of using the new runAction function
action.runAction(1)
    .then((result) => {
        if(result && result.success){
            console.log('Action ran succesfully', result);
        }else {
            console.log('Action has failed', result);
        }
    })
    .catch(error => {
        console.error('Error running action:', error);
    });
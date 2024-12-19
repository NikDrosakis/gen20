/**
Attempt to async load cubos by Ermis
Import peertopeer method if it's part of another module
Not used but useful for frontend connection with Ermis
*/
const fetch = require('node-fetch');
const Maria = require('../core/Maria');
// Initialize the Maria class with your MySQL config
const maria = new Maria('vivalibro');

//usage if(message.type=='open' && message.text=='PING' && message.system=='vivalibro') {
//      await fetchCubosAndSend(message);
// //}
async function fetchCubosAndSend(message) {
    try {
        // Query to fetch cubo IDs and names from the database
        const cubos = await maria.fa(`
                            SELECT maincubo.area, cubo.name as cubo
                            FROM maincubo
                                     left join main on main.id=maincubo.mainid
                                     left join cubo on cubo.id=maincubo.cuboid
                            where main.name=?`,[message.page]); //[message.page
        // Check if cubos were retrieved
        if (!cubos) {
            console.log('No cubos found for this page.');
            return;
        }
        console.log("cubos",cubos);
        for(const cobo of cubos) {
            let url = `https://vivalibro.com/cubos/index.php?cubo=${cubo.cubo}&area=${cubo.area}&file=public.php`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const html = await response.text();
                const mes = {
                    system: message.system,
                    page: message.page,
                    cast: "one",
                    type: "cubos",
                    html: html,
                    area: cubos[i].area,
                    userid: message.userid,
                    to: message.userid
                };
                //   console.log(mes)
           //     await peertopeer(mes);
            } catch (error) {
                console.error('Error fetching cubo HTML:', error);
            }
        }
    } catch (error) {
        console.error('Error fetching cubos from the database:', error);
    }
}

module.exports = {
    fetchCubosAndSend
};
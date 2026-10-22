import React from "react";
import TestOxygenSection from "../components/TestOxygenSection";
import Breadcrumb from "../components/Breadcrumb";
const Test = ({path,lang, data}) => {
    return  (
            <TestOxygenSection
                selectedShow={{
                    shopid: 4,
                    id: 30,
                    showtime: "2026-01-24 21:00:00",
                    description: "Foco: Η ποίηση της επανάστασης του Ερνέστο Τσε Γκεβάρα - Θέατρο Χωρομορφές Ηράκλειο",
                    max_tickets: 70,
                }}
                quantity={1}
                payerDetails={{name:{given_name:"Nikolaos",surname:"Drosakis",type:2},email_address:"info@gen20.net"}}
            />
    );
};

export default Test;
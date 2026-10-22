
import View1 from "../curriculum/src/main/View1";

const CuboGenerator = () => {
    const cuboData = {
        title: "Cubo Example",
        content: "This is a generated Cubo HTML block.",
        html: View1()
    };

    return new Response(JSON.stringify(cuboData), {
        headers: {
            "Content-Type": "application/json"
        }
    });
};

export default CuboGenerator;

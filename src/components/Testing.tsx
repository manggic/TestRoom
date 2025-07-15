import { getTestAttemptsByTestId, getTestAttempts, getTestAttemptById,getTestAttemptsByStudentId } from "@/services/testAttemptService";
import { getTestsByTeacherId } from "@/services/testService";
import { useEffect } from "react";



function Testing() {
    useEffect(() => {
        async function callApi() {

            // let data = {
            //   test_name: 'testing',
            //   duration_minutes: 20,
            //   created_by:"9e52c68b-e162-432c-88b8-df60e68ae3f3",
            //   questions:[{
            //     question_text:"what is 1 + 1 ?",
            //     options: {a :"2", b:"3", c:"4", d:"5" },
            //     correct_answer: 'b',
            //     marks:2,
            //   }],
            //   description:"hey this is description",
            //   status:"published",
            //   last_updated_by:"9e52c68b-e162-432c-88b8-df60e68ae3f3",
            // }
            const response = await getTestAttemptsByStudentId('01e3587d-562e-4952-9dc7-6642ef682c1f');

            console.log({ response });
        }

        callApi();
    }, []);
    return <div>Testing</div>;
}

export default Testing;

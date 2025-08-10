import { errorHandler } from "@/lib/utils";
import { supabaseClient } from "@/supabase/config";

export async function registerOrganization(formData) {
    try {
        const { data, error } = await supabaseClient
            .from("organizations")
            .insert([
                {
                    request_status: "pending",
                    org_name: formData.org_name,
                    org_address: formData.org_address,
                    pincode: formData.pincode,
                    state: formData.state,
                    city: formData.city,
                    contact_number: formData.contact_number,
                    owner_name: formData.owner_name,
                    email: formData.email,
                },
            ])
            .select();

        if (error) {
            return errorHandler(error);
        }

        return { success: true, data };
    } catch (error) {
        return errorHandler(error);
    }
}

export const checkIfAlreadyRegistered = async ({ email }) => {
    try {
        const { data, error } = await supabaseClient
            .from("organizations")
            .select("email")
            .eq("email", email)
            .single();

            console.log('response ',error || !data);
            

        if (error || !data) {
            // Do not reveal if the email exists, for security reasons
            return false
        }
        return true
    } catch (error) {
         console.log({error});
        return false
    }
};

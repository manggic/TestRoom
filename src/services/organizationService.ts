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

        if (error || !data) {
            // Do not reveal if the email exists, for security reasons
            return false;
        }
        return true;
    } catch (error) {
        console.log('checkIfAlreadyRegistered error', error?.message);
        return false;
    }
};

export const getAllOrg = async () => {
    try {
        const { data, error } = await supabaseClient
            .from("organizations")
            .select("*");

        if (error || !data) {
            return { success: false, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, data: [], message: error.message };
    }
};

export const getAdminsOfOrg = async ({ orgId }) => {
    try {
        const { data: admins, error } = await supabaseClient
            .from("users")
            .select("*")
            .eq("organization_id", orgId)
            .eq("role", "admin");

        if (error || !admins) {
            return { success: false, data: [] };
        }

        const enrichedAdmins = await Promise.all(
            (admins || []).map(async (admin) => {
                const { data: createdTests, error: createdTestsError } =
                    await supabaseClient
                        .from("tests")
                        .select("id, test_name")
                        .eq("organization_id", orgId)
                        .eq("created_by", admin.id);

                if (createdTestsError) throw createdTestsError;

                const created_tests = (createdTests || []).map((test) => ({
                    test_id: test.id,
                    test_name: test.test_name,
                }));

                return {
                    ...admin,
                    created_tests,
                };
            })
        );

        return { success: true, data: enrichedAdmins };
    } catch (error) {
        return { success: false, data: [], message: error.message };
    }
};

export const getOrgById = async ({ orgId }) => {
    try {
        const { data, error } = await supabaseClient
            .from("organizations")
            .select("*")
            .eq("id", orgId)
            .single();

        if (error || !data) {
            return { success: false, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, data: [], message: error.message };
    }
};

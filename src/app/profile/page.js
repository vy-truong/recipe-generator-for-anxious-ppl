"use client";

import { useEffect, useState } from "react";
import { Button, Divider, Group, Loader, Paper, Stack, Text, TextInput, Title, Modal } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import BackLink from "../components/BackLink";
import { useUser } from "../components/UserContext";
import { useToast } from "../components/ToastContext";
import supabase from "../config/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordRedirecting, setIsPasswordRedirecting] = useState(false);

  const [formValues, setFormValues] = useState({
    username: "",
    firstName: "",
    lastName: "",
    gender: "",
    birthday: "",
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);

      let activeUserId = user?.id ?? null;

      if (!activeUserId) {
        await refreshUser();
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          activeUserId = sessionData?.session?.user?.id ?? null;
        } catch (error) {
          console.warn("[ProfilePage] Unable to retrieve session", error);
        }
      }

      if (!activeUserId) {
        setShowLoginModal(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("username, first_name, last_name, gender, birthday")
          .eq("id", activeUserId)
          .single();

        if (error) {
          console.error("[ProfilePage] Failed to fetch profile", error);
          addToast({ type: "error", message: "Could not load profile." });
        } else {
          setProfile(data);
          setFormValues({
            username: data?.username || "",
            firstName: data?.first_name || "",
            lastName: data?.last_name || "",
            gender: data?.gender || "",
            birthday: data?.birthday || "",
          });
          setShowLoginModal(false);
        }
      } catch (error) {
        console.error("[ProfilePage] Unexpected error", error);
        addToast({ type: "error", message: "Unexpected error loading profile." });
      } finally {
        setIsLoading(false);
      }
    };
  
    loadProfile();
  }, [user, refreshUser, addToast, router]);
  

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      addToast({ type: "error", message: "Please log in to update your profile." });
      router.push("/login");
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("users")
        .update({
          username: formValues.username.trim() || null,
          first_name: formValues.firstName.trim() || null,
          last_name: formValues.lastName.trim() || null,
          gender: formValues.gender.trim() || null,
          birthday: formValues.birthday || null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("[ProfilePage] Failed to update profile", error);
        addToast({ type: "error", message: error.message || "Could not update profile." });
      } else {
        console.log("[ProfilePage] Profile updated", formValues);
        addToast({ type: "success", message: "Profile updated successfully." });
        await refreshUser();
      }
    } catch (error) {
      console.error("[ProfilePage] Unexpected error while updating profile", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      addToast({ type: "error", message: "Please log in before deleting your account." });
      router.push("/login");
      return;
    }

    const confirmation = window.confirm("This will permanently delete your account and saved recipes. Continue?");
    if (!confirmation) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const payload = await response.json();

      if (!response.ok) {
        console.error("[ProfilePage] Failed to delete user", payload);
        addToast({ type: "error", message: payload?.error || "Could not delete account." });
      } else {
        addToast({ type: "success", message: "Your account has been deleted." });
        await refreshUser();
        router.push("/");
      }
    } catch (error) {
      console.error("[ProfilePage] Unexpected error while deleting user", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = () => {
    setIsPasswordRedirecting(true);
    router.push("/reset-password");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section
          className={`flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16 transition-all duration-300 ${
            showLoginModal ? "opacity-70 blur-[2px] pointer-events-none select-none" : ""
          }`}
        >
          {/* ─────────────── PROFILE HEADER ─────────────── */}
<div className="flex items-center justify-between mb-6">
  <div>
    <Title order={2} className="text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
      Profile
    </Title>
    <Text size="sm" c="dimmed">
      @{profile?.username || "username"} — {profile?.first_name || ""} {profile?.last_name || ""}
    </Text>
  </div>
  <Button
    radius="lg"
    color="orange"
    onClick={() => setIsEditModalOpen(true)}
  >
    Edit
  </Button>
</div>

{/* ─────────────── MAIN PROFILE CARD ─────────────── */}
{/* <Paper radius="lg" p="xl" withBorder>
  <Stack gap="md">
    <Title order={3}>User information</Title>
    <Text size="sm" c="dimmed">View your personal details.</Text>
    <TextInput label="Email" readOnly value={user?.email || ""} />
    <TextInput label="Username" readOnly value={profile?.username || ""} />
    <Group grow>
      <TextInput label="First name" readOnly value={profile?.first_name || ""} />
      <TextInput label="Last name" readOnly value={profile?.last_name || ""} />
    </Group>
    <TextInput label="Gender" readOnly value={profile?.gender || ""} />
    <TextInput label="Birthday" readOnly value={profile?.birthday || ""} />
  </Stack>
</Paper> */}


          <div className="mx-auto max-w-3xl space-y-8">
            <BackLink href="/results" />

            <Paper radius="lg" p="xl" withBorder component="form" onSubmit={handleProfileSave}>
              <Stack gap="md">
                <Title order={3}>User information</Title>
                <Text size="sm" c="dimmed">
                  Update your personal details and username.
                </Text>
                <TextInput
                  label="Email"
                  readOnly
                  value={user?.email || ""}
                />
                <TextInput
                  label="Username"
                  placeholder="Choose a unique username"
                  value={formValues.username}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, username: event.currentTarget.value }))}
                />
                <Group grow>
                  <TextInput
                    label="First name"
                    value={formValues.firstName}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, firstName: event.currentTarget.value }))}
                  />
                  <TextInput
                    label="Last name"
                    value={formValues.lastName}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, lastName: event.currentTarget.value }))}
                  />
                </Group>
                <TextInput
                  label="Gender"
                  placeholder="Female, Male, Others..."
                  value={formValues.gender}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, gender: event.currentTarget.value }))}
                />
                <TextInput
                  label="Birthday"
                  type="date"
                  value={formValues.birthday}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, birthday: event.currentTarget.value }))}
                />
                <Button type="submit" radius="lg" loading={isSaving}>
                  Save changes
                </Button>
              </Stack>
            </Paper>

            <Paper radius="lg" p="xl" withBorder>
              <Stack gap="md">
                <Title order={3}>Account settings</Title>
                <Text size="sm" c="dimmed">
                  Manage your account security.
                </Text>
                <Button radius="lg" variant="outline" loading={isPasswordRedirecting} onClick={handleChangePassword}>
                  Change password
                </Button>
                <Divider my="sm" />
                <Button radius="lg" color="red" loading={isDeleting} onClick={handleDeleteAccount}>
                  Delete account
                </Button>
              </Stack>
            </Paper>
          {/* <Modal
            opened={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            centered
            radius="lg"
            title="Edit Profile"
            overlayProps={{ opacity: 0.4, blur: 3 }}
          >
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="Choose a unique username"
                value={formValues.username}
                onChange={(e) => setFormValues((prev) => ({ ...prev, username: e.currentTarget.value }))}
              />
              <Group grow>
                <TextInput
                  label="First name"
                  value={formValues.firstName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, firstName: e.currentTarget.value }))}
                />
                <TextInput
                  label="Last name"
                  value={formValues.lastName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, lastName: e.currentTarget.value }))}
                />
              </Group>
              <TextInput
                label="Gender"
                placeholder="Female, Male, Others..."
                value={formValues.gender}
                onChange={(e) => setFormValues((prev) => ({ ...prev, gender: e.currentTarget.value }))}
              />
              <TextInput
                label="Birthday"
                type="date"
                value={formValues.birthday}
                onChange={(e) => setFormValues((prev) => ({ ...prev, birthday: e.currentTarget.value }))}
              />

              <Group justify="end" mt="sm">
                <Button
                  variant="outline"
                  color="gray"
                  radius="lg"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="orange"
                  radius="lg"
                  loading={isSaving}
                  onClick={async () => {
                    await handleProfileSave({ preventDefault: () => {} });
                    setIsEditModalOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Modal> */}


            {/* ALERT FOR NON USER MODAL */}
            <Modal
            opened={showLoginModal}
            onClose={() => {
              setShowLoginModal(false);
              // Go back to previous page or fallback to home if none
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            centered
            lockScroll={false}   
            radius="lg"
            transitionProps={{ transition: "fade", duration: 250 }} // fade animation
            overlayProps={{
              opacity: 0.3, //soft overlay 
              blur: 2, //slight blur
            }}
            title="Access Required"
          >

            <div className="space-y-4 text-[var(--color-text)] dark:text-[var(--color-textd)]">
              <Text size="sm">
                Please <span className="font-medium text-[#FDAA6B]">log in</span> or{" "}
                <span className="font-medium text-[#FDAA6B]">create an account</span> to access your profile.
              </Text>

              <Group justify="center" mt="md">
                <Button
                  radius="lg"
                  color="orange"
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push("/login");
                  }}
                >
                  Log In
                </Button>

                <Button
                  radius="lg"
                  variant="outline"
                  color="orange"
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push("/signup");
                  }}
                >
                  Create Account
                </Button>
              </Group>
            </div>
            </Modal>

          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
import supabase from "../config/supabaseClient";

export default function DeleteAccountSection({
  title = "Delete account",
  description = "This will permanently remove your account and any saved recipes. This action cannot be undone.",
  className = "",
}) {
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user?.id) {
    return null;
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const payload = await response.json();

      if (!response.ok) {
        console.error("[DeleteAccountSection] Failed to delete user", payload);
        addToast({
          type: "error",
          message: payload?.error || "Could not delete account.",
        });
        setIsDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      await refreshUser();
      addToast({ type: "success", message: "Your account has been deleted." });
      setConfirmOpen(false);
      router.replace("/");
    } catch (error) {
      console.error("[DeleteAccountSection] Unexpected error deleting user", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Stack gap="sm" className={className}>
        <Title order={3} className="text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
          {title}
        </Title>
        <Text size="sm" className="text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-80">
          {description}
        </Text>
        <Button radius="lg" color="red" onClick={() => setConfirmOpen(true)}>
          Delete account
        </Button>
      </Stack>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        centered
        radius="lg"
        title="Permanently delete account?"
        overlayProps={{ opacity: 0.35, blur: 2 }}
        classNames={{
          title: "text-[var(--color-text)] dark:text-[var(--color-text)]",
          body: "text-[var(--color-text)] dark:text-[var(--color-text)]",
          content: "text-[var(--color-text)] dark:text-[var(--color-textd)]",
        }}
      >
        <Stack gap="md">
          <Text size="sm" className="text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-85">
            This action cannot be undone. Your saved recipes and account details will be removed
            permanently. Are you sure you want to continue?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button color="red" loading={isDeleting} onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

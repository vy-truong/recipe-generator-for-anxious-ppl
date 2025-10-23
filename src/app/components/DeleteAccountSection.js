"use client";

import { useState } from "react";
import { Modal } from "@mantine/core"; // ⬅️ only this stays Mantine
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
import supabase from "../config/supabaseClient";

export default function DeleteAccountSection() {
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user?.id) return null;

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

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn(
          "[DeleteAccountSection] signOut after delete failed",
          signOutError
        );
      }

      await refreshUser();
      addToast({ type: "success", message: "Your account has been deleted." });
      setConfirmOpen(false);
      router.replace("/");
    } catch (error) {
      console.error(
        "[DeleteAccountSection] Unexpected error deleting user",
        error
      );
      addToast({
        type: "error",
        message: "Unexpected error. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* main layout */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold 
        text-[var(--color-heading)] dark:text-[var(--color-text)]"
        >
          Delete account
        </h2>
      
        <p className="text-sm text-[var(--color-text)]  dark:text-[var(--color-text)] opacity-80">
          This will permanently remove your account and any saved recipes.
          <br />
          This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 transition disabled:opacity-50"
        >
          Delete account
        </button>

      </div>
      <Modal
  opened={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  centered
  radius="lg"
  overlayProps={{ opacity: 0.45, blur: 4 }}
  withinPortal={false}
  classNames={{
    content: "bg-[var(--color-surface)] text-[var(--color-text)] border border-default", // ← key line
    header: "text-[var(--color-text)]",
    body: "text-[var(--color-text)]",
  }}
>
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-semibold text-heading">
      Permanently Delete Account
    </h2>

    {/* don’t use dark: with CSS vars; force override so Mantine can't win */}
    <p className="text-sm !text-[var(--color-text)] opacity-80">
      This action cannot be undone. Your saved recipes and account details
      will be removed permanently. Are you sure you want to continue?
    </p>

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setConfirmOpen(false)}
        disabled={isDeleting}
        className="px-4 py-2 rounded-lg border border-default bg-[var(--color-surface)] hover:opacity-80 transition text-sm font-medium text-[var(--color-text)]"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleConfirmDelete}
        disabled={isDeleting}
        className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition ${
          isDeleting ? "bg-red-500/70 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  </div>
</Modal>




    </>
  );
}

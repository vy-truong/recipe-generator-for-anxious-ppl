"use client";

import { useState } from "react";
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import supabase from "../config/supabaseClient";

const usernameRegex = /^[a-zA-Z0-9._-]+$/;
const passwordRegex = /^[a-zA-Z0-9]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeIdentifier = (value) => value.replace(/\s+/g, "").trim();
const sanitizePassword = (value) => value.replace(/[^a-zA-Z0-9]/g, "").trim();

export default function LoginForm({ onSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateIdentifier = (value) => {
    if (emailRegex.test(value)) return { type: "email", value };
    if (usernameRegex.test(value)) return { type: "username", value };
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const sanitizedIdentifier = sanitizeIdentifier(identifier);
    const sanitizedPassword = sanitizePassword(password);

    const identifierResult = validateIdentifier(sanitizedIdentifier);
    if (!identifierResult) {
      setErrorMessage("Enter a valid email or username.");
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 8 || !passwordRegex.test(sanitizedPassword)) {
      setErrorMessage("Password must be at least 8 letters or numbers.");
      return;
    }

    setIsSubmitting(true);

    try {
      let authResponse;

      if (identifierResult.type === "email") {
        authResponse = await supabase.auth.signInWithPassword({
          email: identifierResult.value,
          password: sanitizedPassword,
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${identifierResult.value}@placeholder.local`,
          password: sanitizedPassword,
        });
        authResponse = { data, error };
      }

      if (authResponse.error) {
        setErrorMessage(authResponse.error.message || "Unable to log in. Please check your credentials.");
      } else {
        if (onSuccess) onSuccess(authResponse.data);
      }
    } catch (error) {
      console.error("[LoginForm] Unexpected error", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper component="form" radius="lg" p="xl" withBorder onSubmit={handleSubmit}>
      <Stack gap="md">
        <div>
          <Title order={3}>Welcome back</Title>
          <Text size="sm" c="dimmed">
            Sign in with your email or username.
          </Text>
        </div>

        {errorMessage ? (
          <Alert color="red" radius="md">
            {errorMessage}
          </Alert>
        ) : null}

        <TextInput
          label="Email or username"
          placeholder="you@example.com or yourusername"
          value={identifier}
          onChange={(event) => setIdentifier(event.currentTarget.value)}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />

        <Button type="submit" size="md" radius="lg" loading={isSubmitting}>
          Log in
        </Button>
      </Stack>
    </Paper>
  );
}

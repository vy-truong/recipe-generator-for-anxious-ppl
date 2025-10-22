"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import supabase from "../config/supabaseClient";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "others", label: "Others" },
];

const nameRegex = /^[a-zA-Z\s-]+$/;
const usernameRegex = /^[a-zA-Z0-9._-]+$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizePlainText = (value) => value.replace(/\s+/g, " ").trim();
const sanitizeEmail = (value) => value.replace(/\s+/g, "").toLowerCase();
const sanitizeUsername = (value) => value.trim();
const sanitizeDate = (value) => (/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(value) ? value : "");
const sanitizePassword = (value) => value.trim();

/**
 * SignupForm renders a Mantine-powered registration form.
 * It collects first/last name, username, password, date of birth, and gender.
 * onSubmit callback receives the form values for parent handling.
 */
export default function SignupForm({ onSubmit }) {
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    dayOfBirth: "",
    gender: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (value) => {
    setFormValues((current) => ({ ...current, [field]: value ?? "" }));
  };

  const handleInputChange = (field) => (event) => {
    const rawValue = event.currentTarget.value;
    const sanitizer =
      {
        firstName: sanitizePlainText,
        lastName: sanitizePlainText,
        email: sanitizeEmail,
        username: sanitizeUsername,
        password: sanitizePassword,
        dayOfBirth: sanitizeDate,
      }[field] || sanitizePlainText;

    const nextValue = sanitizer(rawValue);
    handleChange(field)(nextValue);
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const errors = {};

    if (!nameRegex.test(formValues.firstName)) {
      errors.firstName = "Only letters, spaces, and hyphens are allowed.";
    }

    if (!nameRegex.test(formValues.lastName)) {
      errors.lastName = "Only letters, spaces, and hyphens are allowed.";
    }

    if (!usernameRegex.test(formValues.username)) {
      errors.username = "Username can contain letters, numbers, dots, underscores, or hyphens.";
    }

    const normalizedEmail = sanitizeEmail(formValues.email);
    if (!emailRegex.test(normalizedEmail)) {
      errors.email = "Please provide a valid email address.";
    }

    if (!formValues.password || formValues.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!formValues.dayOfBirth) {
      errors.dayOfBirth = "Please select your birth date.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const payload = { ...formValues, email: sanitizeEmail(formValues.email) };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/welcome` : undefined;

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            first_name: sanitizePlainText(payload.firstName),
            last_name: sanitizePlainText(payload.lastName),
            username: sanitizeUsername(payload.username),
            day_of_birth: payload.dayOfBirth,
            gender: payload.gender,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        console.error("[SignupForm] Supabase signUp error", error);
      } else {
        setSuccessMessage("Please check your email to confirm your account.");
        console.log("[SignupForm] Supabase signUp success", data);
        if (onSubmit) {
          onSubmit(payload);
        }
      }
    } catch (error) {
      console.error("[SignupForm] Unexpected error", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper component="form" radius="lg" p="xl" withBorder onSubmit={handleFormSubmit}>
      <Stack gap="md">
        <div>
          <Title order={3}>Create your account</Title>
          <Text size="sm" c="dimmed">
            Sign up to access your saved recipe anywhere.
          </Text>
        </div>

        {errorMessage ? (
          <Alert color="red" radius="md">
            {errorMessage}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert color="green" radius="md">
            {successMessage}
          </Alert>
        ) : null}

        <Group grow gap="md">
          <TextInput
            label="First name"
            placeholder="Avery"
            value={formValues.firstName}
            onChange={handleInputChange("firstName")}
            error={fieldErrors.firstName}
            required
          />
          <TextInput
            label="Last name"
            placeholder="Smith"
            value={formValues.lastName}
            onChange={handleInputChange("lastName")}
            error={fieldErrors.lastName}
            required
          />
        </Group>

        <TextInput
          label="Email"
          placeholder="avery@example.com"
          type="email"
          value={formValues.email}
          onChange={handleInputChange("email")}
          error={fieldErrors.email}
          required
        />

        <TextInput
          label="Username"
          placeholder="averysmith"
          value={formValues.username}
          onChange={handleInputChange("username")}
          error={fieldErrors.username}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          value={formValues.password}
          onChange={handleInputChange("password")}
          error={fieldErrors.password}
          required
        />

        <TextInput
          label="Date of birth"
          type="date"
          value={formValues.dayOfBirth}
          onChange={handleInputChange("dayOfBirth")}
          error={fieldErrors.dayOfBirth}
          required
        />

        <Select
          label="Gender"
          placeholder="Select your gender"
          data={genderOptions}
          value={formValues.gender}
          onChange={handleChange("gender")}
          required
        />

        <Button type="submit" size="md" radius="lg" loading={isSubmitting}>
          Sign up
        </Button>
      </Stack>
    </Paper>
  );
}

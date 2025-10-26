# TODO: Add Mandatory Field Validation to Registration Steps

## Overview
Add validation for fields marked with (*) in each registration step. If a mandatory field is empty or invalid, display an error message like "Please enter [field name]" and prevent proceeding to the next step.

## Steps to Complete

### 1. Update RegisterStep.tsx
- Add validation for email, phone, password, confirmPassword.
- Check if fields are empty.
- Ensure password matches confirmPassword.
- Display specific error messages.

### 2. Update OnboardStep.tsx
- Add validation for firstName, lastName, dateOfBirth.
- Check if these mandatory fields are empty.
- Display error messages for missing fields.

### 3. Update KYCStep.tsx
- PAN validation is already present, but ensure error for empty PAN.
- Add check in handleContinue for panCard being empty.

### 4. Test the Changes
- Run the application and test each step to ensure validation works.
- Verify error messages appear correctly.

### 5. Additional Steps if Needed
- Check other steps like AgreementStep, PlansStep for mandatory validations.
- Ensure no regressions in existing functionality.

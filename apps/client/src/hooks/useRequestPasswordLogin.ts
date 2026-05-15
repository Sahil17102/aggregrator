// src/hooks/useRequestPasswordLogin.ts

import { useMutation } from "@tanstack/react-query";
import { requestPasswordLoginApi, verifyEmailOtpApi, type AuthFlow } from "../api/auth";

export const useRequestPasswordLogin = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
      flow = "login",
      name,
    }: {
      email: string;
      password?: string;
      flow?: AuthFlow;
      name?: string;
    }) => requestPasswordLoginApi(email, password, flow, name),
  });
};

export const useVerifyEmailOtp = () =>
  useMutation({
    mutationFn: ({
      email,
      otp,
      password,
    }: {
      email: string;
      otp: string;
      password: string;
    }) => verifyEmailOtpApi(email, otp, password),
  });

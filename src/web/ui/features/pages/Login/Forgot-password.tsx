import { ChevronLeftIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/components/ui/card";

import ForgotPasswordForm from "@/features/components/forgot-password-form";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-accent">
      <Card className="z-1 w-full border-none shadow-md sm:max-w-md">
        <CardHeader className="gap-6">
          <div>
            <CardTitle className="mb-1.5 text-2xl">
              Забравихте паролата си?
            </CardTitle>
            <CardDescription className="text-base">
              Въведете имейла си и ние ще Ви изпратим линка за възстановяване на
              паролата
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ForgotPassword Form */}
          <ForgotPasswordForm />
          <div
            className="group mx-auto flex w-fit items-center gap-2"
            onClick={() => navigate("/login")}
          >
            <ChevronLeftIcon className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Назад</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

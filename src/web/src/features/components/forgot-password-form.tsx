"use client";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const ForgotPasswordForm = () => {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Email */}
      <div className="space-y-1">
        <Label className="leading-5 -mt-4" htmlFor="userEmail">
          Въведете имейла си
        </Label>
        <Input type="email" id="userEmail" placeholder="m@example.com" />
      </div>

      <Button
        className="w-full bg-[#f7c44d] text-black hover:bg-accent"
        type="submit"
      >
        Прати линка
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;

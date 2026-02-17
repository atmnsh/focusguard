import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

import { Button, TextInput, Container, Divider } from "@gravity-ui/uikit";
import "./Login.css";

export const SignUp = () => {
  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <p className="login-title">За начало създайте акаунт</p>
        </div>
        <Container className="login-fields">
          <TextInput
            placeholder="Въведете потребителското си име"
            className="g-text-input__control "
          />
          <TextInput
            placeholder="Въведете имейла си"
            className="g-text-input__control "
          />
          <TextInput
            placeholder="Въведете паролата си"
            className="g-text-input__control "
          />
          <TextInput
            placeholder="Повторете паролата си"
            className="g-text-input__control "
          />
        </Container>
        <Button view="action" className="login-submit-button">
          Регистрирайте се
        </Button>
        <div className="login-divider">
          <Divider className="divider-line" />
          <p className="divider-text">ИЛИ</p>
          <Divider className="divider-line" />
        </div>
        <div className="">
          <Button variant="bordered" className="login-submit-button">
            Продължи с Google
          </Button>
        </div>
        <p className="login-footer">
          Вече имате акаунт?&nbsp;
          <Button href="/login" view="flat">
            Продължи
          </Button>
        </p>
      </div>
    </div>
  );
};

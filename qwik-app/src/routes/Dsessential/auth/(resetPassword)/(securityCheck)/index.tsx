import { type Signal, component$ } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
interface Props {
  formState: Signal<"signIn" | "resetPassword">;
  resetState: Signal<
    "default" | "securityCheck" | "resetPassword" | "updatePassword"
  >;
  adminRole: Signal<boolean>;
  style: CSSModuleClasses;
  userName: Signal<string | undefined>;
}

export default component$(
  ({ formState, resetState, adminRole, style, userName }: Props) => {
    return (
      <Form>
        <p>請輸入任意兩項資料</p>
        <br />

        {/* //get student datas
                        foreach (array_keys($_SESSION['temporary']['studentdata']) as $questions)
                            echo '<input placeholder="'.$questions.'" usage="logininput" id="'.$questions.'" name="'.$questions.'" type="text"></input><br>'; */}

        <button
          type="button"
          name="resetpw"
          onClick$={() => {
            resetState.value = "default";
          }}
          value="returnsg1"
        >
          返回
        </button>
        <input
          type="hidden"
          name="_token"
          value="'.$_SESSION['temporary']['_token'].'"
        />

        <button type="submit" name="resetpw" value="verify">
          下一步
        </button>
      </Form>
    );
  }
);

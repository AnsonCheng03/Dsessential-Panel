import { component$ } from "@builder.io/qwik";
import styles from "./index.module.css";
import AttendanceForm from "./component/attendanceForm/attendanceForm";
import StudentData from "./component/studentData/studentData";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useGetAllUser = routeLoader$(async (requestEvent) => {
  const accessToken = requestEvent.sharedMap.get("session").accessToken;
  try {
    const res = await fetch(
      `${process.env.INTERNAL_BACKEND}/users/getAllUsers`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();
    if (data.statusCode) throw data;
    return data;
  } catch (error) {
    console.log(error);
    return ["發生錯誤"];
  }
});

export default component$(() => {
  const options = useGetAllUser().value;
  return (
    <>
      <h1 class={styles.title}>課堂點名表</h1>
      <div class={styles.container}>
        <AttendanceForm options={options} />
        <StudentData />
      </div>
    </>
  );
});

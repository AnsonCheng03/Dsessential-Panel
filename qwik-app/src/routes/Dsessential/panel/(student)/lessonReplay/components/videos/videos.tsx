import { component$, useSignal } from "@builder.io/qwik";
import Search from "./search/search";

export default component$(({ videoList }: any) => {
  const availableMonth = Object.entries(videoList).map(([key, value]) => [
    key,
    Object.keys(value as Object),
  ]);
  const selectedYear = useSignal(availableMonth[0][0] as string);
  const selectedMonth = useSignal(availableMonth[0][1][0] as string);

  return (
    <Search
      availableMonth={availableMonth}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
    />
  );
});

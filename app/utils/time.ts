import dayjs from "dayjs";

export const formatTimestamp = (timestamp: number) => {
  if (!timestamp || timestamp === 0) {
    return "Not set";
  }
  return dayjs(timestamp * 1000).format("YYYY-MM-DD");
};

export const formatTime = (time: string) => {
  if (!time) {
    return "Not set";
  }
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

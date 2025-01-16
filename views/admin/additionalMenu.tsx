import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";
import { Formik, Form, Field } from "formik";
import { Arrow } from "../../icons/arrow";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { RxDotsVertical } from "react-icons/rx";
import CalendarInsta from "./calendarInsta";
import Link from "next/link";
import { getTodaysArtwork } from "../../lib/contentful/calendar";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function ShowArtworkModal() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const downloadArtwork = async () => {
    const zipName = `${dayjs().format("DD MM YYYY")} Show Artwork.zip`;

    const shows = await getTodaysArtwork();

    const zip = new JSZip();

    const imagePromises = shows.shows.map(async (show) => {
      // if there is no artwork then skip
      if (show.artwork === null) return;

      // download image and add to zip file
      const response = await fetch(show.artwork.url);
      const blob = await response.blob();
      zip.file(`${show.title}.jpeg`, blob);
    });

    await Promise.all(imagePromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, zipName);
  };

  const initialValues = {
    date: dayjs().add(2, "days").format("YYYY-MM-DD"),
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="hover:bg-black/10 rounded-lg cursor-pointer">
          <RxDotsVertical />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="border border-black p-2 bg-white shadow-md text-small flex flex-col items-start z-20"
      >
        <DropdownMenu.Item
          className="hover:bg-black/10 px-2 py-1 rounded-lg"
          onClick={() => downloadArtwork()}
        >
          Download todays artwork
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild onSelect={(e) => e.preventDefault()}>
          <CalendarInsta />
        </DropdownMenu.Item>
        <DropdownMenu.Item className="hover:bg-black/10 px-2 py-1 rounded-lg">
          <Link href="/admin/daily-schedule-generator">
            Daily Schedule Artwork
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

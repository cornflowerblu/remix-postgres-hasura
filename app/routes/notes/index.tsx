import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { getUserById } from "../../models/user.server"
import { SignJWT } from "~/auth.server";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = async ({ request }) => {
   const userReq = await requireUserId(request);
   const user = await getUserById(userReq)
   
  invariant(user)

   const { userId = user.id, role = user.role } = user as any
   const jwt = await SignJWT({ userId, role })
   return {
    userId,
    role,
    jwt
   }
};

export default function NoteIndexPage() {
  const data = useLoaderData();

  return (
    <>
    <p>
      No note selected. Select a note on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new note.
      </Link>
    </p>
    <ul>
      <li>User ID: {data.userId}</li>
      <li>User Role: {data.role}</li>
      <li>User JWT: <p>{data.jwt}</p></li>
    </ul>
    </>
  );
}

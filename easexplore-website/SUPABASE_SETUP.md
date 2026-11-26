# Connecting Supabase (login and saved data)

You only need this to switch on login. The website works without it, and you can skip it until you want to test accounts.

Supabase sometimes renames menus. If you cannot find something, use the search box inside the Supabase dashboard.

## Part 1: Create your project (about 5 minutes)

1. Go to https://supabase.com and click **Start your project**. Sign up (the free plan is enough to start).
2. Click **New project** and fill in:
   - **Name:** `easexplore`
   - **Database password:** click **Generate a password** and save it somewhere safe (a password manager is best). You will rarely need it, but you cannot see it again.
   - **Region:** choose **South Asia (Mumbai)**. It is the closest to Pune, so the site feels faster.
3. Click **Create new project** and wait about two minutes.

## Part 2: Copy your two values

1. Open your project, then click the **Connect** button at the top. It shows your **Project URL** and your **publishable key**.
   - You can also find them under **Project Settings > API Keys**.
2. Copy the **Project URL**. It looks like `https://abcdxyz.supabase.co`.
3. Copy the **Publishable key**. It starts with `sb_publishable_`.
   - Older projects show an `anon` key instead. That also works for now.

**Never** copy or share the **secret** key or the **service_role** key. Anyone who has it can read and delete all your data. The publishable key is safe because it is meant to be public.

## Part 3: Put the values in the project

1. In the `easexplore-website` folder, open the file `.env.example` with Notepad.
2. Paste your values after the equals signs, with no spaces and no quote marks:

   ```
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
   ```

3. Click **File > Save As**. For **File name** type `.env` and for **Save as type** choose **All Files (\*.\*)**. Save it in the same folder. (If you save it as `.env.txt` it will not work.)
4. Restart the site: in the black window press **Ctrl+C**, then run `npm run dev` again.

## Part 4: Allow your site address

Supabase only sends people back to addresses you approve.

1. In Supabase, open **Authentication** and then **URL Configuration**.
2. Set **Site URL** to `http://localhost:5173`.
3. Under **Redirect URLs** click **Add URL** and add `http://localhost:5173/**`.
4. Click **Save**.

When the real website goes live, come back and add its address in both places.

## Part 5: Test it

1. Open http://localhost:5173/login and click **Create an account**.
2. Use **your own email address**, the same one you signed up to Supabase with.
3. Open the confirmation email, click the link, and you should land on your Dashboard.
4. Try **Log out**, then **Log in** again, then **Forgot your password?**.

### If testing is blocked or slow

- Supabase's built-in email service only sends to your own team members and is limited to about 2 emails per hour. That is normal while testing.
- To test faster, open **Authentication > Sign In / Providers**, open **Email**, and turn **Confirm email** off. Sign-up then logs you in straight away. **Turn it back on before launch.**

## Part 6: Turn on saved plans (Step 6)

Saved itineraries need one table in your database. You only do this once.

1. In Supabase, open **SQL Editor** in the left menu and click **New query**.
2. On your computer, open the file `supabase/001_itineraries.sql` from the project folder with Notepad, select everything (Ctrl+A) and copy it (Ctrl+C).
3. Paste it into the Supabase query box and click **Run**.
4. You should see **Success. No rows returned.** It is safe to run again if you are not sure it worked.
5. Test it: log in on the site, open **Smart Itinerary**, and click **Save plan**. The plan should appear under **Your saved plans** and on your Dashboard.

What this file does: it creates the `itineraries` table, makes sure every person can only see and delete their own plans, blocks logged-out visitors completely, and limits each person to 50 saved plans.

If saving shows "Saving plans is not set up yet", the file has not been run. If it shows "not allowed yet", run it again and check for a red error message at the bottom of the SQL Editor.

## Part 7: Turn on saved budgets and expenses (Step 7)

The Budget & Expense page needs two more tables: one for expenses and one for each person's daily budget. Do this once, the same way as Part 6.

1. In Supabase open **SQL Editor** and click **New query**.
2. Open `supabase/002_budget.sql` from the project folder with Notepad, select everything (Ctrl+A), copy it (Ctrl+C), and paste it into the Supabase query box.
3. Click **Run**. You should see **Success. No rows returned.** It is safe to run again.
4. Test it: log in, open **Budget & Expense**, set a daily budget, add an expense, then refresh the page. Both should still be there. Open the **Dashboard**: the "Today's budget" card should show your numbers.

What this file does: it creates the `expenses` and `budget_settings` tables, makes sure every person can only see and change their own rows, blocks logged-out visitors completely, rejects impossible values (such as a negative amount or an unknown category), and limits each person to 5,000 saved expenses.

If the Budget page shows "We could not load your budget" with "Saving is not set up yet", this file has not been run. If it says "not allowed yet", run it again and look for a red error message at the bottom of the SQL Editor.

## Part 8: Turn on saved favourites (Step 8)

The hearts on the Food & Stays page need one more table. Do this once, the same way as Parts 6 and 7.

1. In Supabase open **SQL Editor** and click **New query**.
2. Open `supabase/003_favourites.sql` from the project folder with Notepad, select everything (Ctrl+A), copy it (Ctrl+C), and paste it into the Supabase query box.
3. Click **Run**. You should see **Success. No rows returned.** It is safe to run again.
4. Test it: log in, open **Food & Stays**, tap a heart, then refresh the page. The heart should still be filled, and the **Saved** filter should show that place.

What this file does: it creates the `favourites` table, makes sure every person can only see and change their own favourites, blocks logged-out visitors completely, allows each place only once per person, and limits each person to 200 favourites.

## If you see "Saving is not set up yet"

This message appears when you are logged in but the database tables do not exist yet. Nothing is broken: the one-time setup files have not been run.

1. Run **all three** files: `supabase/001_itineraries.sql` (Part 6), `supabase/002_budget.sql` (Part 7) and `supabase/003_favourites.sql` (Part 8). Run them one after the other, each in its own **New query**.
2. Check it worked: in Supabase open **Table Editor** in the left menu. You should see four tables: `itineraries`, `expenses`, `budget_settings` and `favourites`.
3. Go back to the website and refresh the page (F5).

Supabase may ask you to confirm because the files contain the words "drop policy". Click **Run this query**. Those lines only replace security rules, and they never delete saved data.

While you are developing, the red message also adds a short note telling you which file to run. Visitors on the live site never see that note.

## Before you launch to customers (required)

**Connect a real email sender.** Out of the box, Supabase will not deliver confirmation or password-reset emails to anyone outside your own team. Customers would sign up and never receive their email.

1. Create an account with an email sending service. Brevo and Resend both work with Supabase and have free plans.
2. In Supabase open **Authentication > Emails > SMTP Settings**, turn on **Enable custom SMTP**, and enter the sender details your email service gives you.
3. Make sure **Confirm email** is **on**.
4. Add your live website address under **Authentication > URL Configuration**.
5. Send a test sign-up from a different email address (not your own team's) and check the email arrives.

## Security notes

- `.env` is already excluded from version control (listed in `.gitignore`). Never upload it or paste its contents in public.
- The Dashboard page only hides itself from logged-out visitors. Saved data (plans, expenses) is protected by Row Level Security rules inside Supabase. The saved-plans table gets its rules in Part 6 above, and the budget tables get theirs in Part 7 above.

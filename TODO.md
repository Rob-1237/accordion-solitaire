## TEST USER

testuser2@example.com

SRAE_9496rc


Comprehensive Game Save/Load Test Plan

Part 1: Logged-in User Game Persistence

Initial State:

Ensure you are logged out. If you were previously logged in, log out first, or clear your browser's local storage/cache for the app's domain to start fresh.

Login:

Log in with your user account (e.g., testuser@example.com).

Make Moves: Play the game and make at least 5-10 moves.

Test Hard Refresh Persistence:

Perform a hard refresh of your browser (e.g., Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac, or open DevTools and right-click the refresh button for "Hard Reload").

Expected:

You should still be logged in, and the game should resume exactly where you left off after your last move.

Test Browser Close/Reopen Persistence:

Close the browser tab/window completely.

Open a new tab/window and navigate back to your application's URL.

Expected:

You should still be logged in, and the game should resume exactly where you left off.


Part 2: Anonymous User Behavior

Log Out: Log out from your current user account.

Make Anonymous Moves: Play the game without logging in. Make a few moves.

Test Anonymous Persistence:

Perform a hard refresh of the browser or close and reopen the tab.

Expected: The game should start a brand new game, not the anonymous game you just played (because anonymous games are not saved).


Part 3: Advanced Logged-in User Scenarios (Restart & Undo)

Login: Log in with your user account again.

Expected: Your previously saved game (from step 5) should load.

Test Restart Game Saving:

Click the "Restart Game" button.

Make at least 3-5 moves in this newly restarted game.

Refresh the browser.

Expected: The game should load the newly restarted game (with its few moves), not your original long-played game.

Test Undo Saving:

In your current game, make a few more moves.

Use the "Undo" button two or three times.

Refresh the browser.

Expected: The game should load in the state it was in after your undo operations. The undo history should be correctly reflected.


Part 4: Multi-User Isolation (Optional, but highly recommended)

Create Second User: If you haven't already, register a second, completely different user account in your app.

Login with Second User: Log in with this new second user.

Play Second User Game: Play a few moves with the second user.

Switch Back to First User: Log out of the second user. Log in with your first user account.

Expected: Your first user's game (from Part 3) should load, exactly as you left it.

Switch Back to Second User: Log out of the first user. Log in with the second user account.

Expected: The second user's game should load, exactly as you left it.

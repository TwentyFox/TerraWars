<?php
session_start();
$loggedIn = false;
$_SESSION["db"] = pg_connect("host=db.dcs.aber.ac.uk port=5432 dbname=cs25320_21_22_trr14 user=trr14 password=Pancakes24");

//Login System

if (!$_SESSION["db"]) {
    die('Could not connect: ' . pg_error() );
}

if (array_key_exists("playerid",$_SESSION) and !array_key_exists("playerid",$_GET)) {
    $_GET["playerid"] = $_SESSION["playerid"];
}

if (array_key_exists("playerid", $_GET)) {
    $_SESSION["playerid"] = $_GET["playerid"];

    $query = "SELECT * FROM userdata;";

    $res = pg_query($_SESSION["db"], $query);
    $ids = pg_fetch_all_columns($res, 0);

    for ($i = 0; $i < count($ids); $i++) {
        if ($ids[$i] == $_SESSION["playerid"]) {
            $p = pg_fetch_array($res, $i, PGSQL_ASSOC);
            $_SESSION["playername"] = $p["playername"];
            $_SESSION["playerprogress"] = $p["gameprogress"];
            $_SESSION["hue"] = $p["hue"];
            $loggedIn = true;
        }
    }

    if ($loggedIn == false and array_key_exists("playername", $_GET)) {
        $pid = $_GET['playerid'];
        $pn = $_GET['playername'];
        $query = "INSERT INTO userdata VALUES ( '$pid', '$pn', 0, 0)";
        $res = pg_query($_SESSION["db"], $query);

        $_SESSION['playername'] = $pn;
        $loggedIn = true;
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>CS25320 Game Assignment</title>
        <link rel="stylesheet" href="stylesheet.css">
    </head>

    <body>
        <div> 
            <h2>How to Play</h2>
            <ul>
                <li>Use <strong>numbers 1-6</strong> to start building units.</li>
                <li>Use your mouse to position this unit, and <strong>left click</strong> to construct it. Cancel the action with <strong>right click.</strong></li>
                <li><strong>Click on units</strong> to make them stop/go. Use this to tactically position your units, and coordinate your attacks.</li>
                <li><strong>Construct miners</strong> to mine ore to collect more money.</li>
                <li>Navigate the battlefield with the <strong>Up/Down arrow keys.</strong></li>
            </ul>
            <h2>Tips</h2>
            <ul>
                <li>The enemy base is defended by 2 gunships. These units are powerful, so save your money/firepower until you can overcome their autocannons.</li>
                <li>The enemy will constantly bombard you with units. Always be prepared for an attack.</li>
                <li>Build miners early on to build your economy. Remember, more money means more units.</li>
            </ul>
            <h2>Credits</h2>
            <ul>
                <li><a href="https://opengameart.org/content/space-kit-remade">Ship models</a></li>
                <li><a href="https://opengameart.org/content/orange-hq-building-isometric">HQ model</a></li>
                <li><a href="https://opengameart.org/content/pixel-explosion-12-frames">Explosion Sprite</a></li>
                <li><a href="https://opengameart.org/content/game-game">Music</a></li>
                <li><a href="https://opengameart.org/content/sci-fi-sounds">Sound Effects - lasers</a></li>
                <li><a href="https://opengameart.org/content/2-high-quality-explosions">Sounds Effects - Explosions</a></li>
                <li><a href="https://stackoverflow.com/questions/6768793/get-the-full-url-in-php">Code snippet used to access the URL</a></li>
                <li><a href="https://stackoverflow.com/questions/4366730/how-do-i-check-if-a-string-contains-a-specific-word">Code snippet used to test for substring</a></li>
            </ul>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; height: auto; width: 600px;">
            <canvas id="cvs" width="600" height="800" style="border: 1px dotted"></canvas>
            <!-- <button id="startButton" onclick="start()">Start game</button> -->

            <?php
            if ($loggedIn == false) {
                echo "<p>Please create a user profile to start the game:</p>";
                echo "<form action='play.php' method='get'>";
                echo "<label for='playername'>Username: </label>";
                echo "<input required type='text' name='playername'>";
                echo "<input type='hidden' name='playerid' value='" . uniqid() ."'>";
                echo "<input type='submit' value='Create Account'>"; 
                echo "</form>";
            } else {
                echo "<button id='startButton' onclick='start()'>Start game</button>";
                echo "<p>Currently logged in as: " . $_SESSION["playername"] . "</p>";
            }
            ?>
            <!--<p id="scoreLabel">Score on last play through: </p> -->

            <form action="leaderboards.php" method="post">
                <?php
                if ($loggedIn == true) {
                    echo "<input type='hidden' id='name' name='name' value='" . $_SESSION["playername"] . "'>";
                }
                ?>
                <input type="hidden" id="score" name="score" value="0">
                <input type="hidden" id="time" name="time" value="0">
                <?php
                if ($loggedIn == true) {
                    echo "<input type='hidden' id='pid' name='playerid' value='" . $_SESSION["playerid"] ."'>";
                    echo "<input type='submit' id='submitButton' value='Submit Score' disabled='true'>";
                }
                ?>
            </form>
            <?php
            if ($loggedIn == true) {
                echo "<div><p>Player Preferences: </p>";
                echo "<form action='updatePreferences.php' method='post'>";
                echo "<label for='hue'>Team color</label>";
                echo "<input type='range' min='0' max='360' name='hue'>";
                echo "<input type='hidden' id='pid' name='playerid' value='" . $_SESSION["playerid"] ."'>";
                echo "<input type='submit' id='submitButton' value='Update Preferences'>";
                echo "</form></div>";
                $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
                //https://stackoverflow.com/questions/6768793/get-the-full-url-in-php

                if (strpos($actual_link, "?playerid=") !== false) {
                    echo "<p>Your save is located at this link: $actual_link </p>";
                } else {
                    echo "<p>Your save is located at this link: $actual_link" . "?playerid=" . $_SESSION["playerid"] . "</p>";
                }
                
            }
            ?>
        </div>
        <div>
            <h2>Top 25 Leaderboard - Score</h2>
            <?php
            $query = "SELECT name, score, timetaken, time, date FROM leaderboard ORDER BY score DESC LIMIT 25;";
            $res = pg_query($_SESSION["db"], $query);
            echo "<table border='1'>";
            echo "<tr><td>#</td><td>Player</td><td>Score</td><td>Time Taken</td><td>Time</td><td>Date</td></tr>";
            $i = 1;
            while ($a = pg_fetch_row($res)) {
                echo "<tr><td>" . $i++ . "</td>";
                for ($j = 0; $j < pg_num_fields($res); $j++) {
                    echo "<td>" . $a[$j] . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>\n";
            ?>
            <h2>Top 25 Leaderboard - Time</h2>
            <?php
            $query = "SELECT name, score, timetaken, time, date FROM leaderboard ORDER BY timetaken ASC LIMIT 25;";
            $res = pg_query($_SESSION["db"], $query);
            echo "<table border='1'>";
            echo "<tr><td>#</td><td>Player</td><td>Score</td><td>Time Taken</td><td>Time</td><td>Date</td></tr>";
            $i = 1;
            while ($a = pg_fetch_row($res)) {
                echo "<tr><td>" . $i++ . "</td>";
                for ($j = 0; $j < pg_num_fields($res); $j++) {
                    echo "<td>" . $a[$j] . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>\n";
            ?>
            <?php
            if($loggedIn) {
                echo "<h2>" . $_SESSION["playername"] . "'s runs</h2>";
                $query = "SELECT name, score, timetaken, time, date FROM leaderboard WHERE id='" . $_SESSION["playerid"] ."' ORDER BY score DESC;";
                $res = pg_query($_SESSION["db"], $query);
                echo "<table border='1'>";
                echo "<tr><td>#</td><td>Player</td><td>Score</td><td>Time Taken</td><td>Time</td><td>Date</td></tr>";
                $i = 1;
                while ($a = pg_fetch_row($res)) {
                    echo "<tr><td>" . $i++ . "</td>";
                    for ($j = 0; $j < pg_num_fields($res); $j++) {
                        echo "<td>" . $a[$j] . "</td>";
                    }
                    echo "</tr>";
                }
                echo "</table>\n";
            }
            ?>
        </div>
    </body>

    <script src="unitStats.js"></script>
    <script src="AI.js"></script>
    <script src="main.js"></script>

    <?php
    if ($loggedIn) {
        $hue = $_SESSION["hue"];
        echo "<script>setTeamHueShift($hue)</script>";
    }
    ?>
</html>
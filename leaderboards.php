<?php header("Location: play.php"); ?>

<head><meta charset="UTF-8"></head>

<?php

$conn = pg_connect("host=db.dcs.aber.ac.uk port=5432 dbname=cs25320_21_22_trr14 user=trr14 password=Pancakes24");
if (!$conn)
{
    die('Could not connect: ' . pg_error() );
} elseif (array_key_exists("name", $_POST) and array_key_exists("score", $_POST) and array_key_exists("time", $_POST) and array_key_exists("playerid", $_POST)) {

    $playerName = $_POST["name"];
    $playerScore = intval($_POST["score"]);
    $submissionDate = date("d/m/Y");
    $playerID = $_POST["playerid"];
    $submissionTime = date("H:i:s");
    $timeTaken = intval($_POST["time"]);

    if ($playerName == "" or $playerScore == 0 or $timeTaken == 0) {
        die();
    }

    $query = "INSERT INTO leaderboard VALUES ('$playerName', $playerScore, '$submissionDate','$submissionTime',$timeTaken,'$playerID');";
    $res = pg_query($conn, $query);
    echo "<p>" . $_POST["name"] . " " . $_POST["score"] . " " . $res ."</p>";

    exit();
}

?>
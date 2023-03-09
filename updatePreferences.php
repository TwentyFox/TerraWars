<?php header("Location: play.php"); ?>

<head><meta charset="UTF-8"></head>

<?php

$conn = pg_connect("host=db.dcs.aber.ac.uk port=5432 dbname=cs25320_21_22_trr14 user=trr14 password=Pancakes24");
if (!$conn)
{
    die('Could not connect: ' . pg_error() );
} elseif (array_key_exists("hue", $_POST) and array_key_exists("playerid",$_POST)) {

    $hue = intval($_POST["hue"]);
    $playerID = $_POST["playerid"];

    $query = "UPDATE userdata SET hue=$hue WHERE playerid='$playerID'";
    $res = pg_query($conn, $query);

    exit();
}

?>
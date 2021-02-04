SELECT "properties"."city", 
COUNT( "reservations"."id" ) "total_reservations" 
FROM "reservations", "properties" 
WHERE "reservations"."property_id" = "properties"."id" 
GROUP BY "properties"."city" 
ORDER BY "total_reservations" DESC
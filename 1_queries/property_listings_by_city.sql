SELECT "properties".*, 
AVG( "property_reviews"."rating" ) "average_rating" 
FROM "property_reviews", "properties" 
WHERE "property_reviews"."property_id" = "properties"."id" 
AND "properties"."city" = 'Vancouver' 
GROUP BY "properties"."id" 
HAVING AVG( "property_reviews"."rating" ) >= 4 
ORDER BY "properties"."cost_per_night" ASC
LIMIT 10
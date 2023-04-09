SELECT
  p.product_id,
  b.brand_id,
  p.productname,
  p.price,
  p.image,
  p.discount_price,
  p.variation,
  b.brandname,
  w.wish_id
FROM
  product p
  LEFT OUTER JOIN brand as b on p.brand_id = b.brand_id
  LEFT OUTER JOIN wishlist as w on w.product_id = p.product_id
where
  p.subcategory_id = 3;
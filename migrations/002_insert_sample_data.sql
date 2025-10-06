-- Insert sample categories
INSERT INTO categories (name, slug, description, image, sort_order) VALUES
('Action Figures', 'action-figures', 'Superhero and action figure toys', '/images/action-figures.jpg', 1),
('Educational Toys', 'educational-toys', 'Learning and educational toys for kids', '/images/educational-toys.jpg', 2),
('Remote Control', 'remote-control', 'RC cars, drones, and remote control toys', '/images/remote-control.jpg', 3),
('Building Blocks', 'building-blocks', 'Construction and building toys', '/images/building-blocks.jpg', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (
    name, slug, description, short_description, price, compare_price, 
    category_id, stock, sku, weight, dimensions, age_range, tags, 
    is_featured, images
) VALUES
(
    'Superhero Action Figure Set',
    'superhero-action-figure-set',
    'Amazing collection of superhero action figures with detailed costumes and accessories. Perfect for imaginative play and collecting.',
    'Collection of superhero action figures',
    29.99,
    39.99,
    (SELECT id FROM categories WHERE slug = 'action-figures'),
    50,
    'AF-001',
    0.5,
    '{"length": 15, "width": 10, "height": 25}',
    '{"min": 4, "max": 12}',
    '{"superhero", "action", "collectible"}',
    true,
    '[{"url": "/images/superhero-figures.jpg", "alt": "Superhero Action Figures", "isPrimary": true}]'
),
(
    'Educational Learning Tablet',
    'educational-learning-tablet',
    'Interactive educational tablet designed for young learners. Features math, reading, and science activities.',
    'Interactive learning tablet for kids',
    79.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'educational-toys'),
    30,
    'ED-001',
    0.8,
    '{"length": 20, "width": 15, "height": 2}',
    '{"min": 3, "max": 8}',
    '{"educational", "tablet", "learning"}',
    true,
    '[{"url": "/images/learning-tablet.jpg", "alt": "Educational Learning Tablet", "isPrimary": true}]'
),
(
    'Remote Control Racing Car',
    'remote-control-racing-car',
    'High-speed remote control racing car with realistic design and smooth controls. Perfect for outdoor racing fun.',
    'High-speed RC racing car',
    59.99,
    79.99,
    (SELECT id FROM categories WHERE slug = 'remote-control'),
    25,
    'RC-001',
    1.2,
    '{"length": 30, "width": 15, "height": 10}',
    '{"min": 6, "max": 14}',
    '{"remote-control", "racing", "car"}',
    true,
    '[{"url": "/images/rc-car.jpg", "alt": "Remote Control Racing Car", "isPrimary": true}]'
),
(
    'STEM Building Blocks Set',
    'stem-building-blocks-set',
    'Advanced building blocks set designed to teach STEM concepts through hands-on construction and engineering.',
    'STEM building blocks for learning',
    49.99,
    NULL,
    (SELECT id FROM categories WHERE slug = 'building-blocks'),
    40,
    'BB-001',
    2.0,
    '{"length": 25, "width": 20, "height": 15}',
    '{"min": 5, "max": 12}',
    '{"building", "stem", "blocks"}',
    true,
    '[{"url": "/images/stem-blocks.jpg", "alt": "STEM Building Blocks", "isPrimary": true}]'
)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- CIVICCONNECT AI - MYSURU (MCC) SEED DATA (100% IDEMPOTENT)
-- Populate realistic profiles, civic issues, updates, and assignments
-- ====================================================================

-- 1. Insert Initial Profiles (Corporation Officials & Field Workers)
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    preferred_language,
    area,
    department,
    phone,
    worker_status
) VALUES
(
    'c9000000-0000-0000-0000-000000000001',
    'Dr. K. Srinivas',
    'officer@civicconnect.org',
    'corporation',
    'English',
    'Mysuru Citywide',
    'Executive Administration',
    '+91-821-2449800',
    'available'
),
(
    'w1000000-0000-0000-0000-000000000001',
    'Ramesh Rao',
    'ramesh.rao@mcc.gov.in',
    'worker',
    'Kannada',
    'Gokulam & Vontikoppal',
    'Road Maintenance',
    '+91-98451-23401',
    'assigned'
),
(
    'w2000000-0000-0000-0000-000000000002',
    'Anil Kumar',
    'anil.kumar@mcc.gov.in',
    'worker',
    'Kannada',
    'Kuvempunagar & Saraswathipuram',
    'Water & Sewage',
    '+91-98451-23402',
    'assigned'
),
(
    'w3000000-0000-0000-0000-000000000003',
    'Suresh Gowda',
    'suresh.gowda@mcc.gov.in',
    'worker',
    'Kannada',
    'Vijayanagar & Hebbal',
    'Street Lighting',
    '+91-98451-23403',
    'available'
),
(
    'w4000000-0000-0000-0000-000000000004',
    'Priya Sharma',
    'priya.sharma@mcc.gov.in',
    'worker',
    'English',
    'Jayalakshmipuram & VV Mohalla',
    'Garbage & Sanitation',
    '+91-98451-23404',
    'available'
),
(
    'w5000000-0000-0000-0000-000000000005',
    'Manjunath K',
    'manjunath.k@mcc.gov.in',
    'worker',
    'Kannada',
    'City Central Zone',
    'Public Safety & Hazards',
    '+91-98451-23405',
    'available'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    preferred_language = EXCLUDED.preferred_language,
    area = EXCLUDED.area,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    worker_status = EXCLUDED.worker_status;

-- 2. Insert Sample Mysuru Civic Issues
INSERT INTO public.civic_issues (
    id,
    title,
    description,
    category,
    area,
    landmark,
    priority_score,
    priority_level,
    status,
    created_at
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Dangerous potholes and crater on Contour Road near Doctor''s Corner',
    'Multiple deep potholes stretching over 150 meters along Contour Road. Vehicles are swerving into oncoming traffic during peak evening hours, causing severe collision risks.',
    'Roads & Footpaths',
    'Gokulam',
    'Near Doctor''s Corner, 3rd Stage Contour Road',
    88,
    'critical',
    'in_progress',
    NOW() - INTERVAL '4 days'
),
(
    'a2000000-0000-0000-0000-000000000002',
    'Overflowing sewage manhole causing health hazard and foul odor near Complex Circle',
    'Underground sewage line blocked and overflowing onto the pedestrian pathway since last week. Stagnant contaminated water spreading near food stalls and market entrance.',
    'Water & Sewage',
    'Kuvempunagar',
    'Near Kuvempunagar Complex Circle, Vishwamanava Double Road',
    62,
    'high',
    'assigned',
    NOW() - INTERVAL '6 days'
),
(
    'a3000000-0000-0000-0000-000000000003',
    'Non-functioning streetlights along High Tension Double Road',
    'Continuous stretch of 14 streetlights non-operational for over 2 weeks, leading to dark blind spots for pedestrians, evening walkers, and two-wheelers.',
    'Street Lighting',
    'Vijayanagar',
    '2nd Stage, High Tension Double Road Park stretch',
    38,
    'medium',
    'reviewed',
    NOW() - INTERVAL '8 days'
),
(
    'a4000000-0000-0000-0000-000000000004',
    'Illegal construction debris and uncollected garbage blocking storm drain',
    'Heavy dumping of concrete rubble and plastic waste bags blocking rainwater exit points ahead of the monsoon season.',
    'Garbage & Sanitation',
    'Hebbal',
    'Hebbal Industrial Area Main Road near Sub-station',
    55,
    'high',
    'reported',
    NOW() - INTERVAL '2 days'
),
(
    'a5000000-0000-0000-0000-000000000005',
    'Broken pedestrian footpath slabs and exposed steel rebar',
    'Damaged storm drain cover slabs creating open holes on the footpath. Multiple elderly citizens have tripped while walking.',
    'Roads & Footpaths',
    'Jayalakshmipuram',
    'Kalidasa Road near Premier Studio Junction',
    42,
    'medium',
    'reviewed',
    NOW() - INTERVAL '5 days'
),
(
    'a6000000-0000-0000-0000-000000000006',
    'Low-hanging damaged power cable near residential school gate',
    'Snapping electric cable sagging within 2 meters of the road surface, posing an imminent shock hazard during rainy conditions.',
    'Public Safety & Hazards',
    'Saraswathipuram',
    '5th Main Road near Fire Brigade Circle',
    92,
    'critical',
    'assigned',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    area = EXCLUDED.area,
    landmark = EXCLUDED.landmark,
    priority_score = EXCLUDED.priority_score,
    priority_level = EXCLUDED.priority_level,
    status = EXCLUDED.status;

-- 3. Insert Timeline Progress Updates for Mysuru Issues
INSERT INTO public.issue_updates (
    issue_id,
    status,
    description,
    created_at
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'reported',
    'Issue registered by Gokulam residents. Urgency score calculated at 88/100 (CRITICAL).',
    NOW() - INTERVAL '4 days'
),
(
    'a1000000-0000-0000-0000-000000000001',
    'reviewed',
    'MCC Ward Office 23 inspected the road condition and approved emergency asphalt patching.',
    NOW() - INTERVAL '3 days'
),
(
    'a1000000-0000-0000-0000-000000000001',
    'assigned',
    'Road Maintenance Division Team #2 (Ramesh Rao) assigned with hot-mix machinery.',
    NOW() - INTERVAL '2 days'
),
(
    'a1000000-0000-0000-0000-000000000001',
    'in_progress',
    'Sub-base leveling and cold-milling currently underway on Contour Road.',
    NOW() - INTERVAL '1 day'
),
(
    'a2000000-0000-0000-0000-000000000002',
    'reported',
    'Overflowing sewage complaint registered near Kuvempunagar Complex Circle.',
    NOW() - INTERVAL '6 days'
),
(
    'a2000000-0000-0000-0000-000000000002',
    'assigned',
    'MCC Water Supply & Drainage Crew (Anil Kumar) dispatched with jetting machine.',
    NOW() - INTERVAL '4 days'
);

-- 4. Insert Official Municipal Responses
INSERT INTO public.responses (
    issue_id,
    corporation_user_id,
    official_response,
    simplified_response,
    visibility,
    created_at
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'c9000000-0000-0000-0000-000000000001',
    'Pursuant to Section 58 of Karnataka Municipal Corporation Act, MCC Work Order WO-MYS-2026-4109 has been issued. Cold-milling and asphaltic concrete wearing course application is authorized with target completion within 48 hours, weather permitting.',
    'Good news: Mysuru Municipal Corporation (MCC) has approved emergency road repairs. A certified repair crew has already started fixing Contour Road and aims to finish within 48 hours.',
    'public',
    NOW() - INTERVAL '2 days'
),
(
    'a2000000-0000-0000-0000-000000000002',
    'c9000000-0000-0000-0000-000000000001',
    'High-pressure suction jetting unit deployed under Sanitary Sub-division 4. Desilting of main arterial sewer line is in progress to restore normal hydraulic flow.',
    'MCC drainage crew is using a high-pressure jetting machine to clear the blocked sewage line near Kuvempunagar Complex.',
    'public',
    NOW() - INTERVAL '3 days'
);

-- 5. Insert Worker Assignments
INSERT INTO public.assignments (
    issue_id,
    worker_id,
    assigned_by,
    instructions,
    priority_directive,
    target_deadline,
    equipment_required,
    assigned_at,
    status
) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'w1000000-0000-0000-0000-000000000001',
    'c9000000-0000-0000-0000-000000000001',
    'Emergency crater repair. Mobilize hot-mix asphalt unit and traffic safety cones.',
    '🚨 Emergency / Immediate Dispatch',
    'Within 24 Hours',
    ARRAY['Asphalt Hot-Mix & Roller', 'Traffic Barricades & Cones'],
    NOW() - INTERVAL '2 days',
    'assigned'
),
(
    'a2000000-0000-0000-0000-000000000002',
    'w2000000-0000-0000-0000-000000000002',
    'c9000000-0000-0000-0000-000000000001',
    'Jetting and clearance of blocked sewer line near complex.',
    '⚡ High Urgency (24h-48h)',
    'Within 48 Hours',
    ARRAY['Suction Jetting Tanker'],
    NOW() - INTERVAL '4 days',
    'assigned'
);

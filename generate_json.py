import json
import re

def slugify(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

physics_chapters = [
    "Physics & Measurement", "Kinematics", "Laws of Motion", "Work Energy Power",
    "Rotational Motion", "Gravitation", "Properties of Solids & Liquids",
    "Thermodynamics", "Kinetic Theory", "Oscillations & Waves", "Electrostatics",
    "Current Electricity", "Magnetic Effects of Current & Magnetism", "EMI & AC",
    "Electromagnetic Waves", "Optics", "Dual Nature", "Atoms", "Nuclei",
    "Electronic Devices", "Experimental Skills"
]

physics_topics = {
    "Experimental Skills": [
        "Vernier Calipers", "Screw Gauge", "Simple Pendulum Energy-loss Graph",
        "Metre Scale Moments", "Young's Modulus", "Surface Tension by Capillary Rise",
        "Viscosity", "Resonance Tube", "Specific Heat by Mixtures",
        "Metre Bridge Resistivity", "Ohm's Law", "Galvanometer Figure of Merit",
        "Focal Lengths", "Prism Deviation", "Refractive Index",
        "Diode/Zener Characteristics", "Component Identification"
    ],
    "Current Electricity": [
        "Ohm's Law", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer"
    ]
}

chemistry_chapters = [
    "Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure",
    "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry",
    "Chemical Kinetics", "Classification of Elements and Periodicity in Properties", "p-Block Elements",
    "d- and f-Block Elements", "Coordination Compounds", "Purification and Characterisation of Organic Compounds",
    "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens",
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules",
    "Principles Related to Practical Chemistry"
]

math_chapters = [
    "Sets", "Relations", "Complex Numbers", "Quadratic Equations", "Matrices",
    "Determinants", "P&C", "Binomial", "Sequence", "Limits", "Continuity",
    "Differentiability", "Integral", "Differential Equations", "Coordinate Geometry",
    "3D", "Vector", "Statistics", "Probability", "Trigonometry"
]

math_topics = {
    "Complex Numbers": ["Argand diagram and roots"],
    "Matrices": ["Matrix inverse/consistency"],
    "Sequence": ["AP/GP and AM-GM"],
    "Differentiability": ["Derivatives and maxima/minima"],
    "Integral": ["Standard integrals and areas under curves"],
    "Coordinate Geometry": ["Conic sections"],
    "3D": ["Skew lines and shortest distance"],
    "Vector": ["Dot/cross products"],
    "Probability": ["Probability theorems and Bayes' theorem"],
    "Trigonometry": ["Inverse trigonometric functions"]
}

def create_json(subject, chapters, topics_map):
    data = {
        "exam": "JEE Main",
        "version": "2027",
        "subject": subject,
        "chapters": []
    }
    
    order = 1
    for ch in chapters:
        ch_slug = slugify(ch)
        weightage = "Medium"
        est_hours = 10
        if subject == "Physics":
            if ch == "Physics & Measurement": est_hours = 4; weightage = "Low"
            elif ch == "Current Electricity": est_hours = 12; weightage = "High"
            elif ch == "Rotational Motion": est_hours = 16; weightage = "High"
            elif ch == "Thermodynamics": est_hours = 15; weightage = "High"
        
        topics_list = []
        if ch in topics_map:
            for t in topics_map[ch]:
                topics_list.append({
                    "id": slugify(t),
                    "name": t,
                    "completed": False
                })
                
        chapter_obj = {
            "id": f"{slugify(subject)}-{ch_slug}",
            "order": order,
            "name": ch,
            "slug": ch_slug,
            "class": 11 if order <= len(chapters)//2 else 12,
            "subject": subject,
            "estimatedHours": est_hours,
            "weightage": weightage,
            "status": "not_started",
            "topics": topics_list
        }
        data["chapters"].append(chapter_obj)
        order += 1
        
    return data

physics_data = create_json("Physics", physics_chapters, physics_topics)
chemistry_data = create_json("Chemistry", chemistry_chapters, {})
math_data = create_json("Mathematics", math_chapters, math_topics)

base_path = "features/syllabus/data/jee-main"
with open(f"{base_path}/physics.json", "w") as f:
    json.dump(physics_data, f, indent=2)
with open(f"{base_path}/chemistry.json", "w") as f:
    json.dump(chemistry_data, f, indent=2)
with open(f"{base_path}/mathematics.json", "w") as f:
    json.dump(math_data, f, indent=2)

print("JSON files created successfully.")

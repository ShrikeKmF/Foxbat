/////////////////////////////////////////////////////////////////
// Raider Tactical Group Discord Bot - Foxbat
//
// Made by Shrike
// roles.js
// Roles Def File for Foxbat
//
// Discord: https://discord.gg/raidertacticalgroup
/////////////////////////////////////////////////////////////////

// Role IDs as variables
const UNIT_COMMANDER    = '1033575125821440010'; // Unit Commander
const MERC_COUNCIL      = '669012442679869459'; // Merc Council
const HR_LEAD           = '1258905966842220676'; // HR Lead
const HR                = '952904175207981066'; // HR
const INOPS             = '952904108501794816'; // Inops
const INOPS_IN_TRAINING = '1015799954750570566'; // Inops in Training
const ROLEPLAYER        = '1207151097727291443'; // Rolepalyer
const RD                = '952904217557876887'; // R&D
const TEAM_LEAD         = '1138339232482611270'; // Team Lead
const HITMAN            = '1138339155110269050'; // Hitman
const ARES              = '1169170782539235399'; // Ares
const FENRIR            = '1310054368527253595'; // Fenrir
const SABRE             = '1138339180854902795'; // Sabre
const FIREBRAND         = '1138339212446400573'; // Firebrand
const FREELANCER        = '669012337877057581'; // Freelancer
const MERCANARY         = '669012403211599912'; // Freelancer
const CONTRACTOR        = '987956876895457332'; // Contractor
const PROBATION         = '1052884968516362311'; // Probation
const GUEST             = '669029865399517206'; // Guest

const ALL_ROLES = [
    MERC_COUNCIL, HR_LEAD, HR, INOPS, INOPS_IN_TRAINING,
    ROLEPLAYER, RD, TEAM_LEAD, HITMAN, ARES, FENRIR,
    SABRE, FIREBRAND, FREELANCER, MERCANARY, CONTRACTOR,
    PROBATION
  ];

// Define the roles that are allowed to run certain commands
const ALLOWEDROLES = [
    UNIT_COMMANDER,
    MERC_COUNCIL,
    HR_LEAD,
    HR,
    RD,
    TEAM_LEAD
];



module.exports = {
    UNIT_COMMANDER,
    MERC_COUNCIL,
    HR_LEAD,
    HR,
    INOPS,
    INOPS_IN_TRAINING,
    ROLEPLAYER,
    RD,
    TEAM_LEAD,
    HITMAN,
    ARES,
    FENRIR,
    SABRE,
    FIREBRAND,
    FREELANCER,
    MERCANARY,
    CONTRACTOR,
    PROBATION,
    GUEST,
    ALLOWEDROLES,
    ALL_ROLES
};
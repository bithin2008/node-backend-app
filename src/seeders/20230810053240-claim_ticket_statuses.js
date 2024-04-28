
'use strict';
const db = require('../models')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await db.claimTicketStatusesModel.bulkCreate(
        [
            {
                org_id:3,
              ticket_status: "Awaiting Fair Practice Agreement",
              status_description: "AwtFPA",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Ready to Dispatch",
              status_description: "R2DSPTCH",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
         /*    {
                org_id:3,
              ticket_status: "Outsource",
              status_description: "formerly unable to dispatch status",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Awaiting Diagnosis",
              status_description: "AwtDIAG",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            }, */
            {
                org_id:3,
              ticket_status: "Need to follow up and get more info from Customer",
              status_description: "FPHW Rep must reach out to customer to get more info as this is an active ticket",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
         /*    {
                org_id:3,
              ticket_status: "Parts and Pricing",
              status_description: "PandP",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Deliver Reso",
              status_description: "DReso",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            }, */
            {
                org_id:3,
              ticket_status: "Completed",
              status_description: "Cmpl",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
         /*    {
                org_id:3,
              ticket_status: "Options Sent To Customer",
              status_description: "Opt Snt2Cust",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            }, */
            {
              org_id:3,
              ticket_status: "Dispatched",
              status_description: "Dispatched",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Needs Review",
              status_description: "Needs Review",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
           {
              org_id:3,
              ticket_status: "Customer bring their own tech",
              status_description: "Cutomer bring their own tech.",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            }, 
             /* {
              org_id:3,
              ticket_status: "Replacement Agreement Requested",
              status_description: "Rep Agrmnt Req",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
              org_id:3,
              ticket_status: "Replacement Agreement Sent",
              status_description: "Rep Agrmt Snt",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },*/
            {
              org_id:3,
              ticket_status: "Scheduled Tech Appointment",
              status_description: "Tch Schdled",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
           /*  {
               org_id:3,
              ticket_status: "Escalated Reso",
              status_description: "Esc Res",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Approvals",
              status_description: "Approvals",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            }, 
            {
              org_id:3,
              ticket_status: "Reimbursement",
              status_description:
                "Customer agrees to get their own tech and submit a request for reimbursement",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
              org_id:3,
              ticket_status: "Customer PM Quote",
              status_description: "Special Temporary Status for Jason to Use Only",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "ADM Hold",
              status_description:
                "Automated Dispatch has attempted to assign-awaiting appointment acceptance",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Tech Proposed Appointment Time",
              status_description:
                "A tech has proposed his own availability for this appointment",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "ADM Failed",
              status_description: "No Tech Accepted ADM Job'",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Source Unit Or Replacement",
              status_description: "Source a unit or replacement item",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Need To Follow Up And Get More Information From TECHNICIAN",
              status_description: "This is for when we only have some information from technician and we are awaiting for more",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Pending Completion",
              status_description:"All approvals have been given and we are awaiting on the technician or customer to complete the claim",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
              org_id:3,
              ticket_status: "EMAILQUOTES_PANDP",
              status_description: "Email quotes that need to be sent out ASAP for HVAC",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "PANDP-ESCALATIONS",
              status_description: "PandP",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Units Or Parts Ordered",
              status_description: "PandP has submitted the Order with our supplier",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Installation Pending",
              status_description:  "This is a dispatch related to installing a part or order PandP placed",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
              org_id:3,
              ticket_status: "Awaiting Information from Supplier",
              status_description: "Awaiting Information from Supplier",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
              org_id:3,
              ticket_status: "Build RESO",
              status_description: "Build RESO",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },
            {
                org_id:3,
              ticket_status: "Ready To Order",
              status_description: "Ready To Order",
              ticket_identifier: 1,
              created_at: "2023-10-26 06:00:00",
              updated_at: "2023-10-26 06:00:00",
            },*/
          ]
    
    )},

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};


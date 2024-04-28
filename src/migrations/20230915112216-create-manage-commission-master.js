'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {  
    await queryInterface.createTable('hws_commissions_master', {
      commission_type_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        name: 'hws_property_types_org_id_fk',
        references: {
          model: 'hws_organizations',
          key: 'org_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_organizations=>org_id",
        validate: {
          notNull: {
            msg: "Please select a organization",
          },
          notEmpty: {
            msg: "organisation name cannot be empty",
          },
  
        },
      },
      commission_type: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: "Policy=>1, SPIFF=>2, One Day Sale=>3"
      },
      policy_term: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null
      },
      total_months: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: null
      },
      lower_limit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Min value cannot be empty",
          }
        }
      },
      upper_limit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Max value cannot be empty",
          }
        }
      },
      price_percentage: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: "Price=>0,Percentage=>1",
      },
      commission_value: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "Commission Value cannot be empty",
          }
        }
      },
      commission_times: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "How many times commission will paid after Full Payment",
      },
      spiff_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "SPIFF amount cannot be empty",
          }
        }
      },
      one_day_sale_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: null,
        validate: {
          notEmpty: {
            msg: "One day sale amount cannot be empty",
          }
        }
      },
      active_status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 1,
        comment: "active=>1, inactive=>0",
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_commissions_master_created_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_commissions_master_updated_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      deleted_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        name: 'hws_commissions_master_deleted_by_fk',
        references: {
          model: 'hws_org_users',
          key: 'org_user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: "table=>hws_org_users=>org_user_id",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      }
    }, {
      schema: 'hws_schema'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('hws_commissions_master', 'hws_commissions_master_created_by_fk');
    await queryInterface.removeConstraint('hws_commissions_master', 'hws_commissions_master_updated_by_fk');
    await queryInterface.removeConstraint('hws_commissions_master', 'hws_commissions_master_deleted_by_fk');
    await queryInterface.dropTable('hws_commissions_master');
  }
};
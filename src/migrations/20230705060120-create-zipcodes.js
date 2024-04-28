'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'hws_zipcodes',
      {

        zip_code_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        zipcode: {
          type: Sequelize.STRING,
          unique: {
            msg: 'Zip Code already exist'
          },
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Zip Code cannot be empty",
            }
          }
        },
        org_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          name: 'hws_zipcodes_org_id_fk',
         
          references: {
            model: 'hws_organizations',
            key: 'org_id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
          comment: "table=>hws_organizations=>org_id",
          defaultValue:3,
          validate: {
            notNull: {
              msg: "Please select a organization",
            },
            notEmpty: {
              msg: "Organisation name cannot be empty",
            },
    
          },
        }, 
        
        city: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "City name cannot be empty",
            }
          }
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "State name cannot be empty",
            }
          }
        },
        statecode: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "State Code cannot be empty",
            }
          }
        },
        state_rate: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue:null,
          validate: {
            notEmpty: {
              msg: "State rate cannot be empty",
            }
          }
        },
        county_rate: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue:null,
          validate: {
            notEmpty: {
              msg: "country rate cannot be empty",
            }
          }
        },
        city_rate: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue:null,
          validate: {
            notEmpty: {
              msg: "city rate cannot be empty",
            }
          }
        },
        combined_rate: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue:null,
          validate: {
            notEmpty: {
              msg: "combined rate cannot be empty",
            }
          }
        },
        special_rate: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          defaultValue:null,
          validate: {
            notEmpty: {
              msg: "special rate cannot be empty",
            }
          }
        },
    
        is_serviceable: {
          allowNull: false,
          type: Sequelize.SMALLINT,
          defaultValue: 1,
          comment: "active=>1, inactive=>0",
        },
        lat: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Latitude cannot be empty",
            }
          }
        },
        lon: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Longitute cannot be empty",
            }
          }
        },
        active_status: {
          allowNull: false,
          type: Sequelize.SMALLINT,
          defaultValue: 1,
          comment: "active=>1, inactive=>0",
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: new Date(),
          allowNull: true,
          defaultValue: null,
    
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: new Date(),
          allowNull: true,
          defaultValue: null,
    
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        }
      },
      {
        schema: 'hws_schema',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hws_zipcodes');
    await queryInterface.removeConstraint('hws_zipcodes', 'hws_zipcodes_org_id_fk');
    await queryInterface.dropTable('hws_zipcodes');
  },
};

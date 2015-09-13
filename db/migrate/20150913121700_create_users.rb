class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :first_name, null: false
      t.string :email, uniqueness: true
      t.string :prevention_method, null: false

      t.timestamps
    end
  end
end
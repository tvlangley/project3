class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.string :name
      t.text :message
      t.references :snack, index: true, foreign_key: true
      t.timestamps null: false
    end
  end
end

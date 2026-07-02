import styles from "./RecipeIngredientRow.module.css";

export default function RecipeIngredientRow({

  index,

  ingredient,

  materials,

  onChange,

  onRemove,

}) {

  return (

    <div className={styles.row}>

      {/* Raw Material */}

      <select
        value={ingredient.raw_material_id}
        onChange={(e) =>
          onChange(
            index,
            "raw_material_id",
            e.target.value
          )
        }
      >

        <option value="">
          Select Raw Material
        </option>

        {materials.map((material) => (

          <option
            key={material.id}
            value={material.id}
          >

            {material.material_name}
            {" • "}
            Stock:
            {" "}
            {material.available_stock}
            {" "}
            {material.unit}

          </option>

        ))}

      </select>

      {/* Quantity Required */}

      <input
        type="number"
        min="0"
        step="0.001"
        placeholder="Qty per Product"
        value={ingredient.quantity_per_unit}
        onChange={(e)=>
          onChange(
            index,
            "quantity_per_unit",
            e.target.value
          )
        }
      />

      {/* Unit */}

      <select
        value={ingredient.unit}
        onChange={(e)=>
          onChange(
            index,
            "unit",
            e.target.value
          )
        }
      >

        <option value="Piece">Piece</option>

        <option value="Kg">Kg</option>

        <option value="Gram">Gram</option>

        <option value="Litre">Litre</option>

        <option value="ml">ml</option>

      </select>

      {/* Remove */}

      <button
        type="button"
        className={styles.remove}
        onClick={() => onRemove(index)}
      >

        Remove

      </button>

    </div>

  );

}
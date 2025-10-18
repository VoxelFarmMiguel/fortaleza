# Bug Report: Save/Load Does Not Restore Inventory

## Bug Description
When saving a game with items in inventory and then loading that save, the inventory is not restored. The items disappear entirely - they are neither in the player's inventory nor back in the original room.

## Severity
**HIGH** - This breaks the save/load functionality completely, making it impossible to save progress in the middle of gameplay.

## Reproduction Steps
1. Start the game
2. Open the main door: `abrir puerta principal con abrete sesamo`
3. Enter and exit to exterior: `atravesar puerta principal` → `atravesar puerta principal`
4. Pick up the maza: `tomar maza`
5. Check inventory: `inventario` → Shows "Maza (39)"
6. Save the game: `guardar test1` → "Juego guardado como: test1"
7. Load the game: `cargar test1` → "Juego cargado: test1"
8. Check inventory again: `inventario` → Shows "Usted no lleva nada consigo."

## Expected Behavior
After loading, the inventory should show: "Sus pertenecias son: Maza (39)"

## Actual Behavior
After loading, the inventory is empty: "Usted no lleva nada consigo."

Additionally, the Maza is not returned to the room - it has disappeared entirely from the game.

## Test Output
```
> inventario
Sus pertenecias son:
Maza (39)
Está a punto de agotar sus capacidades.

> guardar test1
Juego guardado como: test1

> cargar test1
Juego cargado: test1
Estás en el exterior de la fortaleza.
Las paredes son muy negras y al parecer, no tienen ventanas. Usted trata de ver el final de las torres, pero las nubes no se lo permiten.
Ves aquí: Roble, Pastel de cerezas, Llamador de bronce, Puerta principal, Túnel, Pared solitaria

> inventario
Usted no lleva nada consigo.
```

Note: Maza is missing from both inventory AND the room listing after load.

## Additional Notes
- The regression test named "Save/Load: Inventory persistence" in `regression-tests.js` does NOT actually test save/load functionality - it only tests taking items and checking inventory
- This bug was supposedly fixed in v2.6 according to TEST_RESULTS.md, but that test doesn't use save/load commands either
- The save/load system appears to save room state but not player inventory state

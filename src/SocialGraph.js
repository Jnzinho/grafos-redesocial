import React, { useState, useCallback } from "react";
import Graph from "react-graph-vis";

const SocialGraph = () => {
  const [graph, setGraph] = useState({
    nodes: [
      {
        id: "Alice",
        label: "Alice",
        color: "#6FA3EF",
        shape: "circle",
        size: 40,
      },
      { id: "Bob", label: "Bob", color: "#6FA3EF", shape: "circle", size: 40 },
      {
        id: "Carol",
        label: "Carol",
        color: "#6FA3EF",
        shape: "circle",
        size: 40,
      },
      {
        id: "David",
        label: "David",
        color: "#6FA3EF",
        shape: "circle",
        size: 40,
      },
      { id: "Eve", label: "Eve", color: "#6FA3EF", shape: "circle", size: 40 },
    ],
    edges: [
      { from: "Alice", to: "Bob" },
      { from: "Alice", to: "David" },
      { from: "Bob", to: "Carol" },
      { from: "Bob", to: "David" },
      { from: "Carol", to: "Eve" },
      { from: "David", to: "Eve" },
    ],
  });

  const [newFriendForm, setNewFriendForm] = useState({
    name: "",
    connections: "",
  });

  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [result, setResult] = useState(null);

  const findShortestPath = useCallback((graph, start, end) => {
    const networkMap = graph.edges.reduce((acc, edge) => {
      acc[edge.from] = acc[edge.from] || [];
      acc[edge.to] = acc[edge.to] || [];
      acc[edge.from].push(edge.to);
      acc[edge.to].push(edge.from);
      return acc;
    }, {});

    if (!networkMap[start] || !networkMap[end])
      return { path: null, distance: Infinity };

    const visited = new Set();
    const queue = [{ node: start, path: [start], distance: 0 }];

    while (queue.length > 0) {
      const { node, path, distance } = queue.shift();
      if (node === end) return { path, distance };

      if (!visited.has(node)) {
        visited.add(node);
        for (const neighbor of networkMap[node] || []) {
          if (!visited.has(neighbor)) {
            queue.push({
              node: neighbor,
              path: [...path, neighbor],
              distance: distance + 1,
            });
          }
        }
      }
    }

    return { path: null, distance: Infinity };
  }, []);

  const options = {
    layout: { hierarchical: false },
    edges: {
      color: "#000000",
      width: 3,
      arrows: {
        to: {
          enabled: false, // Disable arrows
        },
        from: {
          enabled: false, // Disable arrows
        },
      },
    },
    physics: { enabled: true },
  };

  const events = {
    select: (event) => {
      const { nodes: selectedNodes } = event;

      if (selectedStart && selectedEnd) {
        return false;
      }

      if (selectedNodes.length === 1) {
        if (!selectedStart) {
          setSelectedStart(selectedNodes[0]);
        } else if (!selectedEnd && selectedNodes[0] !== selectedStart) {
          setSelectedEnd(selectedNodes[0]);
        }
      }
    },
  };

  const addFriend = () => {
    const { name, connections } = newFriendForm;

    if (!name) return;

    setGraph((prevGraph) => {
      const existingNode = prevGraph.nodes.find((node) => node.id === name);

      const updatedNodes = existingNode
        ? prevGraph.nodes
        : [
            ...prevGraph.nodes,
            {
              id: name,
              label: name,
              color: "#6FA3EF",
              shape: "circle",
              size: 40,
            },
          ];

      const updatedEdges = [...prevGraph.edges];
      if (connections) {
        const friendConnections = connections.split(",").map((c) => c.trim());

        friendConnections.forEach((friend) => {
          const existingEdge = updatedEdges.find(
            (edge) =>
              (edge.from === name && edge.to === friend) ||
              (edge.from === friend && edge.to === name)
          );

          if (!existingEdge) {
            updatedEdges.push({ from: name, to: friend });
            updatedEdges.push({ from: friend, to: name });
          }
        });
      }

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
      };
    });

    setNewFriendForm({ name: "", connections: "" });
  };

  const calculatePath = () => {
    if (selectedStart && selectedEnd) {
      const result = findShortestPath(graph, selectedStart, selectedEnd);
      setResult(result);
    }
  };

  const resetSelection = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setResult(null);
  };

  // Modify the graph nodes to highlight selected nodes
  const modifiedGraph = {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      color:
        node.id === selectedStart
          ? "#FF6B6B" // Red for start node
          : node.id === selectedEnd
          ? "#4ECDC4" // Teal for end node
          : "#6FA3EF", // Original blue for other nodes
      size: node.id === selectedStart || node.id === selectedEnd ? 50 : 40,
    })),
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-3">
        Menor Caminho em Rede Social - Rede de Amigos
      </h2>
      <p className="text-sm mb-3">
        Clique em dois nós para calcular o menor caminho. o caminho atualmente
        selecionado será exibido abaixo. para calcular um novo caminho, clique
        em resetar.
      </p>

      <div className="mb-3 bg-white p-3 rounded-lg shadow">
        <div className="flex flex-row space-x-2">
          <input
            type="text"
            value={newFriendForm.name}
            onChange={(e) =>
              setNewFriendForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nome do Amigo"
            className="px-3 py-2 border rounded text-base flex-0.6"
          />
          <input
            type="text"
            value={newFriendForm.connections}
            onChange={(e) =>
              setNewFriendForm((prev) => ({
                ...prev,
                connections: e.target.value,
              }))
            }
            placeholder="Amigos conectados (separados por vírgula)"
            className="px-3 py-2 border rounded text-base flex-1"
          />
          <button
            onClick={addFriend}
            className="px-4 py-2 bg-blue-500 text-white rounded text-base"
          >
            Adicionar Amigo
          </button>
        </div>
      </div>

      <Graph
        key={JSON.stringify(modifiedGraph)}
        graph={modifiedGraph}
        options={options}
        events={events}
        style={{ height: "350px", borderRadius: "8px" }}
      />

      <div className="mt-3">
        <p className="text-base">
          <strong>Selecionado:</strong>{" "}
          <span
            className={`font-bold ${
              selectedStart ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {selectedStart || "Nenhum"}
          </span>{" "}
          →{" "}
          <span
            className={`font-bold ${
              selectedEnd ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {selectedEnd || "Nenhum"}
          </span>
        </p>

        <div className="flex gap-3 mt-3">
          <button
            onClick={calculatePath}
            disabled={!selectedStart || !selectedEnd}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 text-base"
          >
            Calcular Caminho
          </button>
          <button
            onClick={resetSelection}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-base"
          >
            Resetar
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-3">
          {result.path ? (
            <p className="text-green-600 text-base">
              <strong>Menor Caminho:</strong> {result.path.join(" → ")} <br />
              <strong>Distância:</strong> {result.distance}
            </p>
          ) : (
            <p className="text-red-600 text-base">Nenhum caminho encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialGraph;

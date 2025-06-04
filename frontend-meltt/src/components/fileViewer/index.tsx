function FileViewer({ url }: { url: string }) {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <iframe
                src={url}
                width="100%"
                height="100%"
                title="Visualizador de Arquivo"
            />
        </div>
    );
}

export default FileViewer
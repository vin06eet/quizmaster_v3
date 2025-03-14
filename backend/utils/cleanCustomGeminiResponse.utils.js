const cleanCustomGeminiResponse = (response) => {
    const withoutMarkdown = response.replace(/```/g, '').replace(/```/g, '').trim();
    const jsonStartIndex = withoutMarkdown.indexOf('{');
    const jsonEndIndex = withoutMarkdown.lastIndexOf('}') + 1;
    if (jsonStartIndex === -1 || jsonEndIndex === -1)
        throw new Error('Invalid JSON response from Gemini');
    return withoutMarkdown.substring(jsonStartIndex, jsonEndIndex);
};

export {cleanCustomGeminiResponse}
